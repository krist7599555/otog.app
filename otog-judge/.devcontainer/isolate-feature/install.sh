#!/bin/bash
# apt-get update 
# apt-get install libcap-dev
if [ ! -z $VERSION ]; then
    wget "https://github.com/ioi/isolate/archive/refs/tags/v$VERSION.tar.gz" -O isolate.tar.gz
else
    wget "https://github.com/ioi/isolate/archive/refs/tags/v1.9.tar.gz" -O isolate.tar.gz
fi
echo "Unzip .tar.gz ioi isolate"
tar -xzf ./isolate.tar.gz --one-top-level=isolate --strip-components 1
cd ./isolate-1.9
echo "Make ioi isolate"
make isolate
echo "Done!"