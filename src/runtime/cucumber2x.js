const _ = require('lodash');
const chai = require('chai');
const EventEmitter = require('events');

const stepDefinitionProcessor = require('../stepDefinitionProcessor');

module.exports = function runCucumber2x({ features, stepDefinitions, modules, logger }) {
    const cucumber = window.cucumber2;
    const dependencies = {
        cucumber,
        chai
    };
    if (!cucumber) {
        logger.error('Expected CucumberJS 2 script files to be loaded. Exiting...');
        return Promise.resolve();
    }

    logger.info(`Starting CucumberJS 2.3.1...\n`);

    const loadedFeatures = features.map(({ name, source }) => cucumber.FeatureParser.parse({
        scenarioFilter: new cucumber.ScenarioFilter({}),
        source,
        uri: `/${name}`
    }));

    cucumber.clearSupportCodeFns();
    stepDefinitions
        .map(stepDefinitionProcessor)
        .forEach(i => new Function('__dependencies', i)(dependencies)); // eslint-disable-line no-new-func

    const supportCodeLibrary = cucumber.SupportCodeLibraryBuilder.build({
        cwd: '/',
        fns: cucumber.getSupportCodeFns()
    });

    const formatterOptions = {
        colorsEnabled: true,
        cwd: '/',
        log: i => logger.log(i),
        supportCodeLibrary: supportCodeLibrary
    };
    var prettyFormatter = cucumber.FormatterBuilder.build('pretty', formatterOptions);

    var runtime = new cucumber.Runtime({
        features: loadedFeatures,
        listeners: [prettyFormatter],
        supportCodeLibrary: supportCodeLibrary
    });
    return runtime.start();
};
