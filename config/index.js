// configuration for testjam.io
const runtimes = require('./runtimes.json');
const themes = require('./themes.json');
const strings = require('./lang/en-US.json');

const stepSource = `// Step definition file:

// load CucumberJS based on selected runtime version.
const { Given, When, Then } = require('@cucumber/cucumber');


// imported modules are automatically downloaded using browserify-cdn.
    const assert = require('assert');

    Given('my step definition runs...', function () {
        // step definition code.
    });
`;

const featureSource = `# Gherkin feature file:

Feature: my feature

  Scenario: my scenario
  Given my step definition runs...
`;

export {
    runtimes,
    themes,
    strings,
    featureSource,
    stepSource,
};
