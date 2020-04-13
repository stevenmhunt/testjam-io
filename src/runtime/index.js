const cucumberjsRuntimeBuilder = require('./cucumberjsRuntimeBuilder');

const mapping = {
    'CucumberJS 6.x': cucumberjsRuntimeBuilder('6.0.5'),
    'CucumberJS 5.x': cucumberjsRuntimeBuilder('5.1.0'),
    'CucumberJS 4.x': cucumberjsRuntimeBuilder('4.2.1'),
    'CucumberJS 3.x': cucumberjsRuntimeBuilder('3.2.1'),
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
