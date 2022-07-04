// configuration for testjam.io

const stepSource = "// Step definition file:\n\n" +
  "// load CucumberJS based on selected runtime version.\n" +
  "const { Given, When, Then } = require('@cucumber/cucumber');\n\n" +
  "// imported modules are automatically downloaded using browserify-cdn.\n" +
  "const assert = require('assert');\n\n" +
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
