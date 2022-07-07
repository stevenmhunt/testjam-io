const { indent } = require('indent.js');

const javascript = {
    label: 'NodeJS',
    value: 'javascript',
    tidy: (source) => indent.js(source, { tabString: '    ' }),
    stepSource: `// Step definition file:

// load Cucumber.js based on selected runtime version (use 'cucumber' for legacy versions...)
const { Given, When, Then } = require('@cucumber/cucumber');

// imported modules are automatically downloaded using browserify-cdn
const assert = require('assert');

Given('my step definition runs...', function () {
    // step definition code.
});
    
`,
};

const java = {
    label: 'Java',
    value: 'java',
    stepSource: `// Step definition file:

/*
 * Step definition class for Cucumber-JVM.
 */
public class MySteps {

    // Note: Cucumber-JVM is automatically imported.
    @Given("my step definition runs...")
    public void given_my_step_definition() {
        // step definition code.
    }
}`,
};

const ruby = {
    label: 'Ruby',
    value: 'ruby',
    stepSource: `# Step definition file:

Given("my step definition runs...") do
    # step definition code.
end
`,
};

module.exports = {
    javascript,
    java,
    ruby,
};
