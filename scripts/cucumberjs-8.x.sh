#!/bin/bash

CUKEDIR="/tmp/cucumberjs8"
cucumberjs_8x="./build/js/runtimes/cucumberjs-8.x.js"

if [ ! -f $cucumberjs_8x ]; then
    if [ -d $CUKEDIR ]; then
        chmod -R 777 $CUKEDIR && rm -r $CUKEDIR
    fi
    mkdir -p $CUKEDIR
    TESTJAMDIR=`pwd`
    pushd $CUKEDIR
    git clone  --depth 1 https://github.com/cucumber/cucumber-js.git --branch v8.3.1
    cd cucumber-js
    cp "$TESTJAMDIR/scripts/testjam_helper_8.x.ts" ./test/testjam_helper.ts
    echo "import { executeTests as executeTestsFn, buildSupportCodeLibrary as buildSupportCodeLibraryFn } from '../test/testjam_helper'" | cat - ./src/index.ts > temp.ts
    mv -f temp.ts ./src/index.ts
    echo "" >> ./src/index.ts
    echo "export const executeTests = executeTestsFn" >> ./src/index.ts
    echo "export const buildSupportCodeLibrary = buildSupportCodeLibraryFn" >> ./src/index.ts
    npm install
    npx genversion --es6 src/version.ts && 
        npx tsc --build tsconfig.node.json && 
        npx shx cp src/importer.js lib/src && 
        npx shx cp src/wrapper.mjs lib/src
    cp ./package.json ./lib
    echo "module.exports = {};" > ./process
    npx browserify ./lib/src/index.js --standalone Cucumber -o ../cucumber.js
    popd
    cp $CUKEDIR/cucumber.js $cucumberjs_8x
    chmod -R 777 $CUKEDIR && rm -r $CUKEDIR
fi;
