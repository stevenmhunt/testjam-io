
build: 1.x 2.x 3.x 4.x 5.x 6.x build-web

clean:
	(test -d ./build && rm -r ./build || echo "build folder already cleaned");

init:
	mkdir -p ./build && \
	cp -r ./www/* ./build && \
	mkdir -p ./build/js/runtimes;

build-web: npm-install
	npm run client-build;

npm-install:
	if [ ! -d "./node_modules" ]; then \
	    npm install; \
	fi;

github_url=https://raw.githubusercontent.com/cucumber/cucumber-js
cucumberjs_1x=./build/js/runtimes/cucumberjs-1.x.js
cucumberjs_2x=./build/js/runtimes/cucumberjs-2.x.js
cucumberjs_3x=./build/js/runtimes/cucumberjs-3.x.js
cucumberjs_4x=./build/js/runtimes/cucumberjs-4.x.js
cucumberjs_5x=./build/js/runtimes/cucumberjs-5.x.js
cucumberjs_6x=./build/js/runtimes/cucumberjs-6.x.js

1.x: download-1.x
	sed -i 's/g.cucumber =/g.__cucumber1 =/g' ${cucumberjs_1x};

2.x: download-2.x
	sed -i 's/g.Cucumber =/g.__cucumber2 =/g' ${cucumberjs_2x};

3.x: download-3.x
	sed -i 's/g.Cucumber =/g.__cucumber3 =/g' ${cucumberjs_3x};

4.x: download-4.x
	sed -i 's/g.Cucumber =/g.__cucumber4 =/g' ${cucumberjs_4x};

5.x: download-5.x
	sed -i 's/g.Cucumber =/g.__cucumber5 =/g' ${cucumberjs_5x};

6.x: download-6.x
	sed -i 's/g.Cucumber =/g.__cucumber6 =/g' ${cucumberjs_6x};

################## Download required files from the Internet ######################

download-1.x: init
	if [ ! -f "${cucumberjs_1x}" ]; then \
	    curl -s https://wzrd.in/standalone/cucumber@1.3.3 -o ${cucumberjs_1x}; \
	fi;

download-2.x: init
	if [ ! -f "${cucumberjs_2x}" ]; then \
		curl -s ${github_url}/2.x/dist/cucumber.js -o ${cucumberjs_2x}; \
	fi;

download-3.x: init
	if [ ! -f "${cucumberjs_3x}" ]; then \
		curl -s ${github_url}/3.x/dist/cucumber.js -o ${cucumberjs_3x}; \
	fi;

download-4.x: init
	if [ ! -f "${cucumberjs_4x}" ]; then \
		curl -s ${github_url}/4.x/dist/cucumber.js -o ${cucumberjs_4x}; \
	fi;

download-5.x: init
	if [ ! -f "${cucumberjs_5x}" ]; then \
		curl -s ${github_url}/5.x/dist/cucumber.js -o ${cucumberjs_5x}; \
	fi;

download-6.x: init
	if [ ! -f "${cucumberjs_6x}" ]; then \
		curl -s ${github_url}/6.x/dist/cucumber.js -o ${cucumberjs_6x}; \
	fi;
