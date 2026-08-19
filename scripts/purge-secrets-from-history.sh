#!/bin/sh
#
# Redacts committed secrets from every commit in this repository's history.
#
# This repository committed two secrets before the cleanup: a MongoDB password
# (hardcoded in mernapp/backend/db.js) and a JWT signing secret (hardcoded in
# mernapp/backend/Routes/Createuser.js).
#
# ---------------------------------------------------------------------------
# THIS FILE CONTAINS NO SECRET MATERIAL — KEEP IT THAT WAY
# ---------------------------------------------------------------------------
# An earlier version of this script spelled the leaked JWT secret's prefix out
# in full so it could grep for it. That made the script another committed copy
# of the thing it exists to remove, and the pre-commit hook now rejects it.
#
# So the values live in a git-ignored list file instead, and this script reads
# them at run time. Do not paste a literal secret into this file to "simplify"
# it — the hook will block the commit, and it will be right to.
# ---------------------------------------------------------------------------
#
# ---------------------------------------------------------------------------
# READ THIS BEFORE RUNNING
# ---------------------------------------------------------------------------
# This rewrites history. Every commit SHA from the first offending commit
# onwards changes. Consequences:
#
#   * Anyone with a clone must re-clone or hard-reset. Their old branches will
#     not fast-forward.
#   * It only affects the remote after `git push --force`, which is destructive.
#   * Even after a force-push, GitHub keeps the old objects reachable by SHA
#     until it garbage-collects, and any fork, clone, PR ref or cached view
#     keeps its own copy.
#
# So: THIS SCRIPT IS NOT A SUBSTITUTE FOR ROTATING THE CREDENTIALS. The values
# have been publicly fetchable. Treat them as compromised no matter what this
# script does:
#
#   * Atlas -> Database Access -> edit the database user -> new password.
#     (Then update MONGO_URI in mernapp/backend/.env.)
#   * The JWT secret is already replaced in backend/.env. Rotating it
#     invalidates existing customer tokens, which is the desired outcome.
#
# Run rotation FIRST. Then, if you still want the history cleaned, run this.
# ---------------------------------------------------------------------------
#
# Usage:
#     sh scripts/purge-secrets-from-history.sh            # dry run, reports only
#     sh scripts/purge-secrets-from-history.sh --apply    # actually rewrite
#
#     # optional: point at a different list of values to redact
#     sh scripts/purge-secrets-from-history.sh --secrets /path/to/list.txt
#
# The list file holds one literal value per line; blank lines and lines
# starting with `#` are ignored. Start from the template:
#
#     cp scripts/secrets-to-purge.example scripts/secrets-to-purge.txt
#
# scripts/secrets-to-purge.txt is git-ignored. Delete it when you are done.
#
set -e

APPLY=0
SECRETS_FILE=""

while [ $# -gt 0 ]; do
    case "$1" in
        --apply)   APPLY=1 ;;
        --secrets) SECRETS_FILE="$2"; shift ;;
        -h|--help) sed -n '2,60p' "$0" | sed 's/^#\{1,\} \{0,1\}//'; exit 0 ;;
        *)         echo "Unknown argument: $1" >&2; exit 2 ;;
    esac
    shift
done

cd "$(git rev-parse --show-toplevel)"

: "${SECRETS_FILE:=${PURGE_SECRETS_FILE:-scripts/secrets-to-purge.txt}}"

# A MongoDB URI carrying an inline username:password. Matching this needs no
# knowledge of the value, so it works even with no list file at all.
URI_RE='mongodb(\+srv)?://[^:/[:space:]]+:[^@/[:space:]]+@'

# --- Load the values to redact ---------------------------------------------
VALUES=""
if [ -f "$SECRETS_FILE" ]; then
    # Refuse to read a list that is itself tracked — that would mean the
    # secrets are already committed again.
    if git ls-files --error-unmatch "$SECRETS_FILE" >/dev/null 2>&1; then
        echo "ERROR: $SECRETS_FILE is tracked by git. It must be git-ignored." >&2
        echo "       Remove it from the index (git rm --cached) before running this." >&2
        exit 1
    fi
    VALUES=$(grep -v -e '^[[:space:]]*$' -e '^[[:space:]]*#' "$SECRETS_FILE" || true)
fi

if [ -z "$VALUES" ]; then
    echo "No value list found at $SECRETS_FILE."
    echo "Running in pattern-only mode: connection strings with inline"
    echo "credentials will be found and redacted, but an opaque literal such as"
    echo "a JWT secret cannot be located without being named. To include those:"
    echo
    echo "    cp scripts/secrets-to-purge.example $SECRETS_FILE"
    echo "    # add one literal value per line, then re-run"
    echo
else
    echo "Loaded $(printf '%s\n' "$VALUES" | wc -l | tr -d ' ') value(s) to redact from $SECRETS_FILE."
    echo
fi

# --- Find the affected paths across all history ----------------------------
# Only these paths get rewritten. Filtering every file would be far slower:
# this repository's history contains a committed node_modules.
COMMITS=$(git rev-list --all)
[ -z "$COMMITS" ] && { echo "Empty history. Nothing to do."; exit 0; }

scan_history() {
    # shellcheck disable=SC2086
    {
        git grep -l -I -E -e "$URI_RE" $COMMITS 2>/dev/null || true
        if [ -n "$VALUES" ]; then
            printf '%s\n' "$VALUES" | while IFS= read -r v; do
                # shellcheck disable=SC2086
                git grep -l -I -F -e "$v" $COMMITS 2>/dev/null || true
            done
        fi
    } | sed 's/^[0-9a-f]*://' | sort -u
}

echo "Scanning $(printf '%s\n' "$COMMITS" | wc -l | tr -d ' ') commit(s)..."
AFFECTED=$(scan_history)

if [ -z "$AFFECTED" ]; then
    echo "No secrets found in history. Nothing to do."
    exit 0
fi

echo
echo "Files carrying a secret somewhere in history:"
printf '%s\n' "$AFFECTED" | sed 's/^/  /'

if [ "$APPLY" -ne 1 ]; then
    cat <<EOF

Dry run only — nothing was changed.

To rewrite, first make sure your working tree is committed or stashed, then:

    sh $0 --apply

Afterwards, verify and publish:

    git log --oneline                       # SHAs will have changed
    git push --force-with-lease origin main # DESTRUCTIVE — see header

Then ask GitHub Support to garbage-collect the unreferenced objects, and
delete any forks that still carry them.
EOF
    exit 0
fi

# --- Apply -----------------------------------------------------------------
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo
    echo "ERROR: your working tree has uncommitted changes." >&2
    echo "git filter-branch needs a clean tree. Commit or stash first." >&2
    exit 1
fi

# --- Restore point ----------------------------------------------------------
# A tag is NOT usable here: `--tag-name-filter cat` rewrites tags along with
# everything else, so a tag created now ends up pointing at the REWRITTEN
# history — and the `git gc --prune=now` below then makes the originals
# unreachable for good. A bundle is a separate file, so it survives the prune.
#
# That also means the bundle is a full copy of the un-redacted history: it
# CONTAINS THE SECRETS. Keep it off any shared drive and delete it once the
# rewrite looks right.
ORIG_HEAD=$(git rev-parse HEAD)
BUNDLE="$(dirname "$(pwd)")/$(basename "$(pwd)")-pre-secret-purge-$(git rev-parse --short HEAD).bundle"
git bundle create "$BUNDLE" --all >/dev/null 2>&1
echo
echo "Restore point written: $BUNDLE"
echo "  Original HEAD: $ORIG_HEAD"
echo "  Recover with:  git clone \"$BUNDLE\" restored-repo"
echo "  It holds the UN-REDACTED history — delete it once you are satisfied."

# --- Build the sed program --------------------------------------------------
# Written outside the working tree: filter-branch checks each commit out over
# the tree, so anything stored inside it would vanish mid-run.
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT INT TERM
SED_PROGRAM="$WORK/redact.sed"
PATH_LIST="$WORK/paths"

printf '%s\n' "$AFFECTED" > "$PATH_LIST"

# Keep the host, drop the credentials — a redacted host is still readable, and
# this leaves credential-free URIs (mongodb://localhost:27017) alone.
cat > "$SED_PROGRAM" <<'EOF'
s#mongodb+srv://[^:/"'` 	]*:[^@/"'` 	]*@#mongodb+srv://REDACTED:REDACTED@#g
s#mongodb://[^:/"'` 	]*:[^@/"'` 	]*@#mongodb://REDACTED:REDACTED@#g
EOF

# Escape each literal for a sed BRE pattern, and for the `#` delimiter.
# `]` leads the bracket expression so it is treated as a literal member.
if [ -n "$VALUES" ]; then
    printf '%s\n' "$VALUES" |
        awk '{ gsub(/[][\\.^$*#]/, "\\\\&"); print "s#" $0 "#REDACTED_SEE_BACKEND_ENV#g" }' \
        >> "$SED_PROGRAM"
fi

export SED_PROGRAM PATH_LIST

echo
echo "Rewriting history..."

# --tree-filter is slower than --index-filter but is the straightforward way to
# edit file CONTENT rather than just add or remove paths.
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --force --tree-filter '
    while IFS= read -r f; do
        [ -f "$f" ] && sed -i -f "$SED_PROGRAM" "$f"
    done < "$PATH_LIST"
    true
' --tag-name-filter cat -- --all

echo
echo "Cleaning up filter-branch refs..."
rm -rf .git/refs/original
git reflog expire --expire=now --all
git gc --prune=now --aggressive >/dev/null 2>&1 || git gc --prune=now >/dev/null 2>&1

echo
echo "Verifying..."
REMAINING=$(scan_history)
if [ -n "$REMAINING" ]; then
    echo "  WARNING: a secret is still present in:" >&2
    printf '%s\n' "$REMAINING" | sed 's/^/    /' >&2
    echo "  Inspect manually." >&2
    exit 1
fi
echo "  Clean: no secret remains in any commit."

cat <<EOF

Local history is rewritten. The remote is UNCHANGED until you run:

    git push --force-with-lease origin main

Reminder: rotate the credentials regardless — see the header of this script.

Clean up when you are satisfied — both of these hold secrets in the clear:
    rm "$SECRETS_FILE"
    rm "$BUNDLE"

If anything looks wrong, the pre-rewrite history is in that bundle:
    git clone "$BUNDLE" restored-repo
EOF
