// configuration for testjam.io
const themes = require('./themes.json');
const strings = require('./lang/en-US.json');

const featureSource = `# Gherkin feature file:

Feature: my feature

  Scenario: my scenario
  Given my step definition runs...
`;

export {
    themes,
    strings,
    featureSource,
};
