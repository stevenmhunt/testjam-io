// configuration for testjam.io

module.exports = {
    runtimes: require('./runtimes.json'),
    themes: require('./themes.json'),
    featureSource: `
# In your feature file, you can define scenarios which will be executed as tests.

Feature: Simple maths
In order to do maths
As a developer
I want to increment variables
      
Scenario: easy maths
  Given a variable set to 1
   When I increment the variable by 1
   Then the variable should contain 2
      
Scenario Outline: much more complex stuff
  Given a variable set to <var>
   When I increment the variable by <increment>
   Then the variable should contain <result>
Examples:
|var|increment|result|
|100|    5    |  105 |
| 99|   1234  | 1333 |
| 12|    5    |  17  |`,
    stepSource: `
// Welcome! you can require packages at the top of your code just like in NodeJS.
// Go to the configuration section to add NPM packages (note: must be compatible with browserify-cdn)

const { Given, When, Then, setWorldConstructor } = require('cucumber');
const { expect } = require('chai');
const { sleep } = require('wait-promise');

const WAIT = 100;

var CustomWorld = function() {
    this.variable = 0;
};

CustomWorld.prototype.setTo = function(number) {
    this.variable = parseInt(number);
};

CustomWorld.prototype.incrementBy = function(number) {
    this.variable += parseInt(number);
};

setWorldConstructor(CustomWorld);

///// Step definitions /////
//
// use 'Given', 'When' and 'Then' to declare step definitions
//

Given('a variable set to {int}', function(number) {
    this.setTo(number);
    return sleep(WAIT);
});

When('I increment the variable by {int}', function(number) {
    this.incrementBy(number);
    return sleep(WAIT);
});

Then('the variable should contain {int}', function(number) {
    expect(this.variable).to.eql(number)
    return sleep(WAIT);
});`
};
