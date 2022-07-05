#!/bin/bash

CUKEDIR="/tmp/cucumberjs7"
cucumberjs_7x="./build/js/runtimes/cucumberjs-7.x.js"

if [ ! -f $cucumberjs_7x ]; then
    if [ -d $CUKEDIR ]; then
        chmod -R 777 $CUKEDIR && rm -r $CUKEDIR
    fi
    mkdir -p $CUKEDIR
    TESTJAMDIR=`pwd`
    pushd $CUKEDIR
    git clone  --depth 1 https://github.com/cucumber/cucumber-js.git --branch v7.3.2
    cd cucumber-js
    cp "$TESTJAMDIR/scripts/testjam_helper_7.x.ts" ./test/testjam_helper.ts
    echo "import { executeTests as executeTestsFn, buildSupportCodeLibrary as buildSupportCodeLibraryFn } from '../test/testjam_helper'" | cat - ./src/index.ts > temp.ts
    mv -f temp.ts ./src/index.ts
    echo "" >> ./src/index.ts
    echo "export const executeTests = executeTestsFn" >> ./src/index.ts
    echo "export const buildSupportCodeLibrary = buildSupportCodeLibraryFn" >> ./src/index.ts
    npm install
    npx tsc -p tsconfig.node.json
    cp ./package.json ./lib
    npx browserify ./lib/src/index.js --standalone Cucumber -o ../cucumber.js
    popd
    cp $CUKEDIR/cucumber.js $cucumberjs_7x
    chmod -R 777 $CUKEDIR && rm -r $CUKEDIR
fi;
