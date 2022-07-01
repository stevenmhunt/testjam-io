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
    git clone  --depth 1 https://github.com/cucumber/cucumber-js.git --branch 7.x
    cd cucumber-js
    cp "$TESTJAMDIR/scripts/testjam_helper.ts" ./test
    echo "import { executeTests as executeTestsFn, buildSupportCodeLibrary as buildSupportCodeLibraryFn } from '../test/testjam_helper'" | cat - ./src/index.ts > temp.ts
    mv -f temp.ts ./src/index.ts
    echo "" >> ./src/index.ts
    echo "export const executeTests = executeTestsFn" >> ./src/index.ts
    echo "export const buildSupportCodeLibrary = buildSupportCodeLibraryFn" >> ./src/index.ts
    npm install
    npm run build-local
    cp ./package.json ./lib
    browserify ./lib/src/index.js --standalone Cucumber -o ../cucumber.js
    popd
    cp $CUKEDIR/cucumber.js $cucumberjs_7x
    # chmod -R 777 $CUKEDIR && rm -r $CUKEDIR
fi;
