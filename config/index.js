// configuration for testjam.io

const stepSource = "// Step definition file:\n\n" +
  "const { Given, When, Then } = require('cucumber'); // load CucumberJS based on selected runtime version.\n" +
  "const assert = require('assert'); // imported modules are automatically downloaded using browserify-cdn.\n\n" +
  "Given('my step definition runs...', function () {\n    // step definition code.\n});\n";

const featureSource = "# Gherkin feature file:\n\n" +
  "Feature: my feature\n\n" +
  "  Scenario: my scenario\n" +
  "  Given my step definition runs...";

module.exports = {
  runtimes: require('./runtimes.json'),
  themes: require('./themes.json'),
  strings: require('./lang/en-US.json'),
  featureSource: featureSource,
  stepSource: stepSource
};
