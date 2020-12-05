#!/bin/sh
set -e

#
# Runs the tsoa generation tool and uses Git to detect if the files need to be updated
# (generated files have changed after running it)
#
# Used in CI pipelines to prevent outdated files
#

# Constants
SWAGGER_FILE_PATH="./docs/swagger.yaml"

# Run generation
npm run tsoa:gen

# Detect if Open API specs had to be updated
changes="$(git diff --name-only HEAD "${SWAGGER_FILE_PATH}")"
if [ -n "$changes" ]; then
  echo "Open API specs have changed:"
  git --no-pager diff "${SWAGGER_FILE_PATH}"
  echo "Please update them by running 'npm run tsoa:gen'"
  exit 1
fi
