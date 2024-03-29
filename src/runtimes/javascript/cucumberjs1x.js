const { version: testjamVersion } = require('../../../package.json');
const { loadStackChain, executeScriptUrl, waitUntilExists } = require('../../utils/scripts');
const stepDefinitionFormatter = require('../../formatters/stepDefinitionFormatter');

const libname = '__cucumber1';

function load() {
    return loadStackChain('cucumber1x_preload', '1.3.7')
        .then(() => executeScriptUrl('cucumber1x', `/js/runtimes/cucumberjs-1.x.min.js?r=${testjamVersion}`))
        .then((result) => waitUntilExists(libname, result));
}

function execute({
    features, stepDefinitions, packages, logger, dialect,
}) {
    const cucumber = window[libname];
    if (!cucumber) {
        logger.error('Expected Cucumber.js 1.x script files to be loaded. Exiting...');
        return Promise.resolve();
    }

    logger.info('Starting Cucumber.js 1.3.3...\n');
    const dependencies = { ...packages, cucumber };

    const loadedFeatures = features.map(({ source }) => source).join('\n\n');

    const functions = stepDefinitions
        .map(stepDefinitionFormatter)
        // eslint-disable-next-line no-new-func
        .map((i) => new Function('__dependencies', 'console', i));

    function supportCode() {
        functions.forEach((f) => f.call(this, dependencies, logger));
    }

    const instance = cucumber(loadedFeatures, supportCode);

    const formatterOptions = {
        colorsEnabled: true,
        language: dialect,
        logToFunction: (i) => logger.info(i),
    };

    const listener = cucumber.Listener.PrettyFormatter(formatterOptions);
    instance.attachListener(listener);

    try {
        return new Promise((resolve) => { instance.start(resolve); });
    } catch (err) {
        return Promise.reject(err);
    }
}

module.exports = {
    load, execute,
};
