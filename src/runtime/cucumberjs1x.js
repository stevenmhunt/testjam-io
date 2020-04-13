const { loadStackChain, executeScriptUrl, waitUntilExists } = require('../utils/scripts');
const stepDefinitionFormatter = require('../formatters/stepDefinitionFormatter');

const libname = '__cucumber1';

function load() {
    return loadStackChain('cucumber1x_preload', '1.3.7')
        .then(() => executeScriptUrl('cucumber1x', '/js/runtimes/cucumberjs-1.x.js'))
        .then(result => waitUntilExists(libname, result));
}

function execute({ features, stepDefinitions, packages, logger }) {
    const cucumber = window[libname];
    if (!cucumber) {
        logger.error('Expected CucumberJS 1.x script files to be loaded. Exiting...');
        return Promise.resolve();
    }

    logger.info(`Starting CucumberJS 1.3.3...\n`);
    const dependencies = Object.assign({}, packages, { cucumber });

    const loadedFeatures = features.map(({ source }) => source).join('\n\n');

    const functions = stepDefinitions
        .map(stepDefinitionFormatter)
        .map(i => new Function('__dependencies', i));

    function supportCode() {
        functions.forEach(f => f.call(this, dependencies)); // eslint-disable-line no-new-func
    };

    var instance = cucumber(loadedFeatures, supportCode);

    const formatterOptions = {
        colorsEnabled: true,
        logToFunction: i => logger.log(i)
    };

    var listener = cucumber.Listener.PrettyFormatter(formatterOptions);
    instance.attachListener(listener);

    try {
        return new Promise(resolve => instance.start(resolve));
    }
    catch (err) {
        return Promise.reject(err);
    }
};

module.exports = {
    load, execute
};