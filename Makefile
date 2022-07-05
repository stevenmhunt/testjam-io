
build: 1.x 2.x 3.x 4.x 5.x 6.x 7.x 8.x build-web

clean:
	(test -d ./build && rm -r ./build || echo "build folder already cleaned");

init:
	mkdir -p ./build/css && \
	cp -r ./www/* ./build && \
	cp ./node_modules/react-dropdown/style.css ./build/css/react-dropdown.css && \
	cp ./node_modules/react-notifications/lib/notifications.css ./build/css/react-notifications.css && \
	mkdir -p ./build/js/runtimes;

build-web: npm-install
	npm run prod-build;

npm-install:
	if [ ! -d "./node_modules" ]; then \
	    npm install; \
	fi;

github_url=https://raw.githubusercontent.com/cucumber/cucumber-js
cucumberjs_1x=./build/js/runtimes/cucumberjs-1.x
cucumberjs_2x=./build/js/runtimes/cucumberjs-2.x
cucumberjs_3x=./build/js/runtimes/cucumberjs-3.x
cucumberjs_4x=./build/js/runtimes/cucumberjs-4.x
cucumberjs_5x=./build/js/runtimes/cucumberjs-5.x
cucumberjs_6x=./build/js/runtimes/cucumberjs-6.x
cucumberjs_7x=./build/js/runtimes/cucumberjs-7.x
cucumberjs_8x=./build/js/runtimes/cucumberjs-8.x
min=min
1.x: download-1.x
	if [ ! -f "${cucumberjs_1x}.${min}.js" ]; then \
		sed -i 's/g.cucumber =/g.__cucumber1 =/g' ${cucumberjs_1x}.js; \
		npx uglifyjs ${cucumberjs_1x}.js --compress sequences=true,conditionals=true,booleans=true --mangle --output ${cucumberjs_1x}.${min}.js; \
	fi

2.x: download-2.x
	if [ ! -f "${cucumberjs_2x}.${min}.js" ]; then \
		sed -i 's/g.Cucumber =/g.__cucumber2 =/g' ${cucumberjs_2x}.js; \
		cat ${cucumberjs_2x}.js | npx babel -s false  --presets stage-0 --minified --compact true -o ${cucumberjs_2x}.${min}.js; \
	fi

3.x: download-3.x
	if [ ! -f "${cucumberjs_3x}.${min}.js" ]; then \
		sed -i 's/g.Cucumber =/g.__cucumber3 =/g' ${cucumberjs_3x}.js; \
		cat ${cucumberjs_3x}.js | npx babel -s false  --presets stage-0 --minified --compact true -o ${cucumberjs_3x}.${min}.js; \
	fi

4.x: download-4.x
	if [ ! -f "${cucumberjs_4x}.${min}.js" ]; then \
		sed -i 's/g.Cucumber =/g.__cucumber4 =/g' ${cucumberjs_4x}.js; \
		cat ${cucumberjs_4x}.js | npx babel -s false  --presets stage-0 --minified --compact true -o ${cucumberjs_4x}.${min}.js; \
	fi

5.x: download-5.x
	if [ ! -f "${cucumberjs_5x}.${min}.js" ]; then \
		sed -i 's/g.Cucumber =/g.__cucumber5 =/g' ${cucumberjs_5x}.js; \
		cat ${cucumberjs_5x}.js | npx babel -s false  --presets stage-0 --minified --compact true -o ${cucumberjs_5x}.${min}.js; \
	fi

6.x: download-6.x
	if [ ! -f "${cucumberjs_6x}.${min}.js" ]; then \
		sed -i 's/g.Cucumber =/g.__cucumber6 =/g' ${cucumberjs_6x}.js; \
		cat ${cucumberjs_6x}.js | npx babel -s false --presets stage-0 --minified --compact true -o ${cucumberjs_6x}.${min}.js; \
	fi

7.x: download-7.x
	if [ ! -f "${cucumberjs_7x}.${min}.js" ]; then \
		sed -i \
			-e 's/g.Cucumber =/g.__cucumber7 =/g' \
			-e 's/super\./Object\.getPrototypeOf(this\.constructor\.prototype)\./g' \
			-e 's/_c\.fs\.O_CREAT/512/g' \
			-e 's/_c\.fs\.O_EXCL/2048/g' \
			-e 's/_c\.fs\.O_RDWR/2/g' \
			-e 's/_c\.os\.errno\.EBADF/9/g' \
			-e 's/_c\.os\.errno\.ENOENT/2/g' \
			-e 's/fs\.rmdirSync\.bind(fs)/function() {}/g' \
			${cucumberjs_7x}.js; \
		cat ${cucumberjs_7x}.js | npx babel -s false --presets stage-0 --minified --compact true --plugins transform-es2015-object-super -o ${cucumberjs_7x}.${min}.js; \
	fi

8.x: download-8.x
	if [ ! -f "${cucumberjs_8x}.${min}.js" ]; then \
		sed -i \
			-e 's/g.Cucumber =/g.__cucumber8 =/g' \
			-e 's/_c\.fs\.O_CREAT/512/g' \
			-e 's/_c\.fs\.O_EXCL/2048/g' \
			-e 's/_c\.fs\.O_RDWR/2/g' \
			-e 's/_c\.os\.errno\.EBADF/9/g' \
			-e 's/_c\.os\.errno\.ENOENT/2/g' \
			-e 's/fs\.rmdirSync\.bind(fs)/function() {}/g' \
			-e 's/catch {/catch (err) {/g' \
			-e 's/= detectSupport(stream, env, enabled)/= true/g' \
			-e 's/methods\.performance\.now()/Date\.now()/g' \
			${cucumberjs_8x}.js; \
		cat ${cucumberjs_8x}.js | npx babel -s false --presets stage-0 --minified --compact true --plugins transform-es2015-object-super -o ${cucumberjs_8x}.${min}.js; \
	fi
################## Download required files from the Internet ######################

download-1.x: init
	if [ ! -f "${cucumberjs_1x}.js" ]; then \
	    curl -s https://cdn.testjam.io/standalone/cucumber@1.3.3 -o ${cucumberjs_1x}.js; \
	fi;

download-2.x: init
	if [ ! -f "${cucumberjs_2x}.js" ]; then \
		curl -s ${github_url}/2.x/dist/cucumber.js -o ${cucumberjs_2x}.js; \
	fi;

download-3.x: init
	if [ ! -f "${cucumberjs_3x}.js" ]; then \
		curl -s ${github_url}/3.x/dist/cucumber.js -o ${cucumberjs_3x}.js; \
	fi;

download-4.x: init
	if [ ! -f "${cucumberjs_4x}.js" ]; then \
		curl -s ${github_url}/4.x/dist/cucumber.js -o ${cucumberjs_4x}.js; \
	fi;

download-5.x: init
	if [ ! -f "${cucumberjs_5x}.js" ]; then \
		curl -s ${github_url}/5.x/dist/cucumber.js -o ${cucumberjs_5x}.js; \
	fi;

download-6.x: init
	if [ ! -f "${cucumberjs_6x}.js" ]; then \
		curl -s ${github_url}/6.x/dist/cucumber.js -o ${cucumberjs_6x}.js; \
	fi;

download-7.x: init
	chmod +x ./scripts/cucumberjs-7.x.sh && ./scripts/cucumberjs-7.x.sh

download-8.x: init
	chmod +x ./scripts/cucumberjs-8.x.sh && ./scripts/cucumberjs-8.x.sh
