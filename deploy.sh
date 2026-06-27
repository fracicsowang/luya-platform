#!/usr/bin/env bash
# One-click deploy: build the static export and publish out/ to the gh-pages branch.
# GitHub Pages serves it at https://fracicsowang.github.io/luya-platform/
set -euo pipefail

REPO="fracicsowang/luya-platform"
BASE_PATH="/luya-platform"
GIT_EMAIL="icydeemail@gmail.com"
GIT_NAME="fracicsowang"

cd "$(dirname "$0")/luya-platform"

echo "▸ Building static export (basePath=${BASE_PATH}) …"
rm -rf .next out
NEXT_PUBLIC_BASE_PATH="${BASE_PATH}" npm run build
touch out/.nojekyll

echo "▸ Publishing out/ → gh-pages …"
cd out
git init -q
git checkout -q -b gh-pages
git add -A
git -c user.email="${GIT_EMAIL}" -c user.name="${GIT_NAME}" commit -q -m "Deploy $(date -u +%Y-%m-%dT%H:%MZ)"
git push -f "https://x-access-token:$(gh auth token)@github.com/${REPO}.git" gh-pages
rm -rf .git

echo "✓ Deployed → https://fracicsowang.github.io/luya-platform/"
