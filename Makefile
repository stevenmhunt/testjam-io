
build: 1.x 2.x 3.x 4.x 5.x 6.x build-web

clean:
	(test -d ./build && rm -r ./build || echo "build folder already cleaned");

init:
	mkdir -p ./build && \
	cp -r ./www/* ./build && \
	mkdir -p ./build/js;

build-web: npm-install
	npm run client-build;

npm-install:
	if [ ! -d "./node_modules" ]; then \
	    npm install; \
	fi;

1.x: download-1.x
	sed -i 's/g.cucumber =/g.cucumber1 =/g' ./build/js/cucumber-1.x.js;

2.x: download-2.x
	sed -i 's/g.Cucumber =/g.cucumber2 =/g' ./build/js/cucumber-2.x.js;

3.x: download-3.x
	sed -i 's/g.Cucumber =/g.cucumber3 =/g' ./build/js/cucumber-3.x.js;

4.x: download-4.x
	sed -i 's/g.Cucumber =/g.cucumber4 =/g' ./build/js/cucumber-4.x.js;

5.x: download-5.x
	sed -i 's/g.Cucumber =/g.cucumber5 =/g' ./build/js/cucumber-5.x.js;

6.x: download-6.x
	sed -i 's/g.Cucumber =/g.cucumber6 =/g' ./build/js/cucumber-6.x.js;

################## Download required files from the Internet ######################

download-1.x: init
	if [ ! -f "./build/js/cucumber-1.x.js" ]; then \
	    curl -s https://wzrd.in/standalone/cucumber@1.3.3 -o ./build/js/cucumber-1.x.js; \
	fi;

download-2.x: init
	if [ ! -f "./build/js/cucumber-2.x.js" ]; then \
		curl -s https://raw.githubusercontent.com/cucumber/cucumber-js/2.x/dist/cucumber.js -o ./build/js/cucumber-2.x.js; \
	fi;

download-3.x: init
	if [ ! -f "./build/js/cucumber-3.x.js" ]; then \
		curl -s https://raw.githubusercontent.com/cucumber/cucumber-js/3.x/dist/cucumber.js -o ./build/js/cucumber-3.x.js; \
	fi;

download-4.x: init
	if [ ! -f "./build/js/cucumber-4.x.js" ]; then \
		curl -s https://raw.githubusercontent.com/cucumber/cucumber-js/4.x/dist/cucumber.js -o ./build/js/cucumber-4.x.js; \
	fi;

download-5.x: init
	if [ ! -f "./build/js/cucumber-5.x.js" ]; then \
		curl -s https://raw.githubusercontent.com/cucumber/cucumber-js/5.x/dist/cucumber.js -o ./build/js/cucumber-5.x.js; \
	fi;

download-6.x: init
	if [ ! -f "./build/js/cucumber-6.x.js" ]; then \
		curl -s https://raw.githubusercontent.com/cucumber/cucumber-js/6.x/dist/cucumber.js -o ./build/js/cucumber-6.x.js; \
	fi;
