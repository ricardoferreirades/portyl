#!/usr/bin/env bash

set -euo pipefail

# Conventional commit per file utility
# - Commits each changed file separately
# - Type/scope can be auto-detected or overridden
# - Subject template supports {file}

usage() {
  cat <<EOF
Usage: $(basename "$0") [options]

Options:
  --type <type>           Commit type for all files (feat, fix, docs, chore, ...)
  --scope <scope>         Scope for all files
  --subject <subject>     Subject template; use {file} placeholder (default: "update {file}")
  --only-staged           Only include currently staged files
  --dry-run               Show actions without committing
  -h, --help              Show help and exit
EOF
}

commit_type=""
scope_override=""
subject_template="update {file}"
only_staged=false
dry_run=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --type) commit_type="$2"; shift 2 ;;
    --scope) scope_override="$2"; shift 2 ;;
    --subject) subject_template="$2"; shift 2 ;;
    --only-staged) only_staged=true; shift ;;
    --dry-run) dry_run=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: not inside a git repository" >&2
  exit 1
fi

detect_type_for_path() {
  local path="$1"
  if [[ -n "$commit_type" ]]; then echo "$commit_type"; return; fi
  case "$path" in
    docs/*|**/*.md) echo "docs" ;;
    src/*|src/*/*) echo "feat" ;;
    **/__tests__/*|test/*|tests/*) echo "test" ;;
    rollup.config.*|jest.config.*|vite.config.*|**/tsconfig.json) echo "build" ;;
    package.json|package-lock.json|pnpm-lock.yaml|yarn.lock) echo "chore" ;;
    example/*|examples/*) echo "chore" ;;
    *) echo "chore" ;;
  esac
}

derive_scope_for_path() {
  local path="$1"
  if [[ -n "$scope_override" ]]; then echo "$scope_override"; return; fi
  local first_segment="${path%%/*}"
  if [[ "$first_segment" == "$path" ]]; then
    local base="$(basename "$path")"
    echo "${base%%.*}"
  else
    echo "$first_segment"
  fi
}

format_subject() {
  local template="$1"; local path="$2"
  local filename="$(basename "$path")"
  echo "${template//\{file\}/$filename}"
}

list_changed_files() {
  if $only_staged; then
    git diff --name-only --cached --diff-filter=ACMRTD
  else
    { git diff --name-only --diff-filter=ACMRTD; git diff --name-only --cached --diff-filter=ACMRTD; } | sort -u
  fi
}

mapfile -t files < <(list_changed_files)

if [[ ${#files[@]} -eq 0 ]]; then
  echo "No changes to commit."
  exit 0
fi

echo "Preparing to create ${#files[@]} commits..."

# Ensure clean index each time
git reset >/dev/null 2>&1 || true

for file in "${files[@]}"; do
  if [[ ! -e "$file" ]] && ! git ls-files --deleted --error-unmatch "$file" >/dev/null 2>&1; then
    continue
  fi

  type_for_file="$(detect_type_for_path "$file")"
  scope_for_file="$(derive_scope_for_path "$file")"
  subject_for_file="$(format_subject "$subject_template" "$file")"
  message="${type_for_file}(${scope_for_file}): ${subject_for_file}"

  echo "- $message"
  $dry_run && continue

  git reset >/dev/null 2>&1 || true
  git add -A -- "$file"
  if git diff --cached --quiet -- "$file"; then
    echo "  (no staged diff for $file, skipping)"
    continue
  fi
  git commit -m "$message"
done

echo "Done."


