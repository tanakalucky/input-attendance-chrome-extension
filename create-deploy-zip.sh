#!/bin/bash

set -e

if [ -d "tmp" ]; then
  rm -rf "tmp"
fi

mkdir tmp

cp -r dist/ tmp/dist

cp manifest.json tmp/

zip -r deploy.zip tmp/

echo "Successfully created zip file"

exit 0