import React from 'react';
import SplitPane, { Pane } from 'react-split-pane';

import runCucumber6x from '../runners/cucumber6x';
import Logger from '../Logger';
import eventHub from '../eventHub';

import OutputView from './OutputView.jsx';
import FeatureView from './FeatureView.jsx';
import StepDefinitionView from './StepDefinitionView.jsx';

export default
    class TestRunnerView extends React.Component {
    constructor(props) {
        super(props);
        this.logger = new Logger();

        this.featureName = 'test1.feature';
        this.featureSource = `
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
| 12|    5    |  17  |
`;

        this.stepName = '/step_definitions/steps1.js';
        this.stepSource = `
// Welcome! you can require modules at the top of your code just like in NodeJS.
// Go to the configuration section to add NPM packages (note: must be compatible with browserify-cdn)

const { Given, When, Then, setWorldConstructor } = require('cucumber');
const { expect } = require('chai');

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

function wait() {
    return new Promise(r => setTimeout(r, 500));
}

///// Step definitions /////
//
// use 'Given', 'When' and 'Then' to declare step definitions
//

Given('a variable set to {int}', function(number) {
    this.setTo(number);
    return wait();
});

When('I increment the variable by {int}', function(number) {
    this.incrementBy(number);
    return wait();
});

Then('the variable should contain {int}', function(number) {
    expect(this.variable).to.eql(number)
    return wait();
});
`;

        this.state = {
            featureName: 'test.feature',
            stepName: 'steps.js',
            featureSource: this.featureSource,
            stepSource: this.stepSource
        };

        eventHub.on('test', () => {
            try {
                eventHub.emit('testRunStarted');
                runCucumber6x({
                    features: [{
                        id: 'd0f8784uf8df781',
                        name: this.state.featureName,
                        source: this.state.featureSource
                    }],
                    stepDefinitions: [{
                        id: 'd873hfh74ryhrh7',
                        name: this.state.stepName,
                        source: this.state.stepSource
                    }], logger: this.logger
                }).then((success) => {
                    if (success) {
                        this.logger.log('\nCucumberJS exited with status code 0.\n\n');
                    }
                    else {
                        this.logger.log('\nCucumberJS exited with status code 1.\n\n');
                    }
                    eventHub.emit('testRunEnded', success);
                }).catch((err) => {
                    this.logger.error(this.errorFormatter(err));
                    eventHub.emit('testRunEnded', false);
                });
            }
            catch (err) {
                this.logger.error(this.errorFormatter(err));
                eventHub.emit('testRunEnded', false);
            }
        });

        this.stackFormatter = this.stackFormatter.bind(this);
    }

    errorFormatter(err) {
        return `${err.name}: ${err.message}\n\n${this.stackFormatter(err.stack).split('\n').filter(i => i.indexOf('step_definitions') >= 0)}`;
    }

    stackFormatter(stack) {
        const ignoreLines = [
            '_asyncToGenerator',
            'run@',
            '_callee$@',
            'tryCatch@',
            'invoke@',
            'webpack',
            'defineIteratorMethods',
            'asyncGeneratorStep@',
            '_next@'
        ];

        return stack.split('\n').map((line) => {
            // example lines:
            //      d873hfh74ryhrh7@/js/client.js line 1897 > eval line 75 > Function:13:67
            // ?[90md873hfh74ryhrh7/<@/js/client.js line 1897 > eval line 75 > Function:44:36
            /*const fnNameData = (line || '').split(/[\@\/]+/)[0].split('[');
            const fnName = fnNameData.length === 1 ? fnNameData[0] : fnNameData[fnNameData.length - 1].trim().substring(3);
            const prefix = fnNameData.length === 1 ? '' : `${fnNameData[0]}[${fnNameData[fnNameData.length - 1].substring(0, 3)}`;
            const suffix = fnNameData.length === 1 ? '' : `${fnNameData[0].trim()}[39m`;
            const keys = this.tracked.stepDefinitions.map(i => i.id);
            if (fnName && keys.indexOf(fnName) >= 0) {
                const { name } = this.tracked.stepDefinitions.filter(i => i.id === fnName)[0];
                const [ l, c ] = line.split('Function:')[1].split(':');
                return `${prefix}${name}:${(parseInt(l, 10) - 11)}:${(parseInt(c, 10) - 0)}${suffix}`;
            }*/
            return line;
        }).filter(i => ignoreLines.filter(l => i.indexOf(l) >= 0).length === 0).join('\n');
    }

    onChangeFeature(featureName, featureSource) {
        this.setState(state => ({
            featureName, featureSource
        }))
    }

    onChangeStep(stepName, stepSource) {
        this.setState(state => ({
            stepName, stepSource
        }));
    }

    render() {
        return (<div className="testrunner-view">
            <SplitPane split="vertical" size="100%">
            <div style={{ height: '100%', width: '100%' }}>
                    <SplitPane split="horizontal" size="100%">
                    <div style={{ height: '100%', width: '100%' }}>
                            <FeatureView id="feature_editor_1" name={this.state.featureName} value={this.state.featureSource} onChange={this.onChangeFeature.bind(this)} />
                        </div>
                        <div style={{ height: '100%', width: '100%' }}>
                            <StepDefinitionView id="step_editor_1" name={this.state.stepName} value={this.state.stepSource} onChange={this.onChangeStep.bind(this)} />
                        </div>
                    </SplitPane>
                </div>
                <div style={{ height: '100%', width: '100%' }}>
                    <OutputView logger={this.logger} formatter={this.stackFormatter} />
                </div>
            </SplitPane>
        </div>);
    }
}
