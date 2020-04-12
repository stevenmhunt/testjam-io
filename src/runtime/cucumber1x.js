const _ = require('lodash');
const chai = require('chai');
const EventEmitter = require('events');

const stepDefinitionProcessor = require('../stepDefinitionProcessor');

module.exports = function runCucumber1x({ features, stepDefinitions, modules, logger }) {
    const Cucumber = window.cucumber1;
    const dependencies = {
        cucumber: Cucumber,
        chai
    };
    if (!Cucumber) {
        logger.error('Expected CucumberJS 1 script files to be loaded. Exiting...');
        return Promise.resolve();
    }

    logger.info(`Starting CucumberJS 1.3.3...\n`);

    const loadedFeatures = features.map(({ source }) => source).join('\n\n');

    const functions = stepDefinitions
        .map(stepDefinitionProcessor)
        .map(i => new Function('__dependencies', i));

    function supportCode() {
        functions.forEach(f => f.call(this, dependencies)); // eslint-disable-line no-new-func
    };

    var cucumber = Cucumber(loadedFeatures, supportCode);

    const formatterOptions = {
        colorsEnabled: true,
        logToFunction: i => logger.log(i)
    };

    var listener = Cucumber.Listener.PrettyFormatter(formatterOptions);
    cucumber.attachListener(listener);

    try {
        return new Promise(resolve => cucumber.start(resolve));
    }
    catch (err) {
        return Promise.reject(err);
    }
};
