const { version: testjamVersion } = require('../../../package.json');
const { loadStackChain, executeScriptUrl, waitUntilExists } = require('../../utils/scripts');
const stepDefinitionFormatter = require('../../formatters/stepDefinitionFormatter');

const libname = '__cucumber2';

function load() {
    return loadStackChain('cucumber2x_preload', '1.3.7')
        .then(() => executeScriptUrl('cucumber2x', `/js/runtimes/cucumberjs-2.x.min.js?r=${testjamVersion}`))
        .then((result) => waitUntilExists(libname, result));
}

function execute({
    features, stepDefinitions, packages, logger, dialect,
}) {
    const cucumber = window[libname];
    if (!cucumber) {
        logger.error('Expected Cucumber.js 2.x script files to be loaded. Exiting...');
        return Promise.resolve();
    }

    logger.info('Starting Cucumber.js 2.3.1...\n');
    const dependencies = { ...packages, cucumber };

    const loadedFeatures = features.map(({ name, source }) => cucumber.FeatureParser.parse({
        language: dialect,
        scenarioFilter: new cucumber.ScenarioFilter({}),
        source,
        uri: `/${name}`,
    }));

    cucumber.clearSupportCodeFns();
    stepDefinitions
        .map(stepDefinitionFormatter)
        // eslint-disable-next-line no-new-func
        .forEach((i) => new Function('__dependencies', 'console', i)(dependencies, logger));

    const supportCodeLibrary = cucumber.SupportCodeLibraryBuilder.build({
        cwd: '/',
        fns: cucumber.getSupportCodeFns(),
    });

    const formatterOptions = {
        colorsEnabled: true,
        cwd: '/',
        log: (i) => logger.info(i),
        supportCodeLibrary,
    };
    const prettyFormatter = cucumber.FormatterBuilder.build('pretty', formatterOptions);

    const runtime = new cucumber.Runtime({
        features: loadedFeatures,
        listeners: [prettyFormatter],
        supportCodeLibrary,
    });

    return runtime.start();
}

module.exports = {
    load, execute,
};
