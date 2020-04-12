const mapping = {
    'CucumberJS 6.x': require('./cucumber6x'),
    'CucumberJS 5.x': require('./cucumber5x'),
    'CucumberJS 4.x': require('./cucumber4x'),
    'CucumberJS 3.x': require('./cucumber3x'),
    'CucumberJS 2.x': require('./cucumber2x'),
    'CucumberJS 1.x': require('./cucumber1x')
}

function getRunner(version) {
    if (mapping[version]) {
        return mapping[version]
    }
    throw new Error(`Unable to locate a runtime for ${version}.`);
}

function execute(version, ...args) {
    const runner = getRunner(version);
    return runner(...args);
}

module.exports = {
    getRunner,
    execute
};
