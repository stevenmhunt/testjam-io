const cucumberjsRuntimeBuilder = require('./cucumberjsRuntimeBuilder');
const cucumberjsLegacyRuntimeBuilder = require('./cucumberjsLegacyRuntimeBuilder');

const mapping = {
    'CucumberJS 7.x': cucumberjsRuntimeBuilder('7.3.2'),
    'CucumberJS 6.x': cucumberjsLegacyRuntimeBuilder('6.0.5'),
    'CucumberJS 5.x': cucumberjsLegacyRuntimeBuilder('5.1.0'),
    'CucumberJS 4.x': cucumberjsLegacyRuntimeBuilder('4.2.1'),
    'CucumberJS 3.x': cucumberjsLegacyRuntimeBuilder('3.2.1'),
    'CucumberJS 2.x': require('./cucumberjs2x'),
    'CucumberJS 1.x': require('./cucumberjs1x')
}

function getRuntime(version) {
    if (mapping[version]) {
        return mapping[version]
    }
    throw new Error(`Unable to locate a runtime for '${version}'.`);
}

function executeRuntime(version, ...args) {
    const { execute } = getRuntime(version);
    return execute(...args);
}

function loadRuntime(version) {
    const { load } = getRuntime(version);
    return load();
}

module.exports = {
    getRuntime,
    executeRuntime,
    loadRuntime
};
