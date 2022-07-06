import _ from 'lodash';

const cucumber1 = require('./cucumberjs1x');
const cucumber2 = require('./cucumberjs2x');
const cucumberjsLegacyRuntime = require('./cucumberjsLegacyRuntime');
const cucumberjsRuntime = require('./cucumberjsRuntime');

const labels = {
    'Cucumber.js 8.4.0': 'CucumberJS 8.x',
    'Cucumber.js 7.3.2': 'CucumberJS 7.x',
    'Cucumber.js 6.0.5': 'CucumberJS 6.x',
    'Cucumber.js 5.1.0': 'CucumberJS 5.x',
    'Cucumber.js 4.2.1': 'CucumberJS 4.x',
    'Cucumber.js 3.2.1': 'CucumberJS 3.x',
    'Cucumber.js 2.3.1': 'CucumberJS 2.x',
    'Cucumber.js 1.3.3': 'CucumberJS 1.x',
};

const mapping = {
    'CucumberJS 8.x': cucumberjsRuntime('8.4.0'),
    'CucumberJS 7.x': cucumberjsRuntime('7.3.2'),
    'CucumberJS 6.x': cucumberjsLegacyRuntime('6.0.5'),
    'CucumberJS 5.x': cucumberjsLegacyRuntime('5.1.0'),
    'CucumberJS 4.x': cucumberjsLegacyRuntime('4.2.1'),
    'CucumberJS 3.x': cucumberjsLegacyRuntime('3.2.1'),
    'CucumberJS 2.x': cucumber2,
    'CucumberJS 1.x': cucumber1,
};

function getRuntimes() {
    return _.keys(labels).map((key) => ({
        label: key,
        value: labels[key],
    }));
}

function getRuntime(version) {
    if (mapping[version]) {
        return mapping[version];
    }
    throw new Error(`Unable to locate a runtime for '${version}'.`);
}

function executeRuntime(version, options) {
    const { execute } = getRuntime(version);
    return execute(options);
}

function loadRuntime(version) {
    const { load } = getRuntime(version);
    return load();
}

export {
    getRuntimes,
    executeRuntime,
    loadRuntime,
};
