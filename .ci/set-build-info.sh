#!/bin/sh
set -e

#
# Store build information in package.json so it's available at runtime
#

# we rely on env vars that are normally available in GitHub Actions
# see https://docs.github.com/en/actions/configuring-and-managing-workflows/using-environment-variables#default-environment-variables
if [ -z "$GITHUB_RUN_NUMBER" ]; then
  echo "🛑 Missing env var GITHUB_RUN_NUMBER"
  exit 1
fi

if [ -z "$GITHUB_REF" ]; then
  echo "🛑 Missing env var GITHUB_REF"
  exit 1
fi

if [ -z "$GITHUB_SHA" ]; then
  echo "🛑 Missing env var GITHUB_SHA"
  exit 1
fi

echo "Got GITHUB_RUN_NUMBER=\"$GITHUB_RUN_NUMBER\" GITHUB_REF=\"$GITHUB_REF\" GITHUB_SHA=\"GITHUB_SHA\""

build_date="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "Build date is $build_date"

echo "Setting buildInfo in package.json ... "
sed -i.bak "s/_CI_GIT_COMMIT_SHA/${GITHUB_SHA}/g" package.json && rm package.json.bak
sed -i.bak "s:_CI_GIT_REF:${GITHUB_REF}:g" package.json && rm package.json.bak
sed -i.bak "s/_CI_BUILD_DATE/${build_date}/g" package.json && rm package.json.bak

echo "Done !"
