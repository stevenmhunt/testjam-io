import React from 'react';
import SplitPane from 'react-split-pane';

import app from '../app';
import { featureSource, stepSource } from '../../config';

import OutputView from './OutputView.jsx';
import FeatureView from './FeatureView.jsx';
import StepDefinitionView from './StepDefinitionView.jsx';

export default
    class TestRunnerView extends React.Component {
    constructor(props) {
        super(props);

        this.onChangeFeature = this.onChangeFeature.bind(this);
        this.onChangeStep = this.onChangeStep.bind(this);

        const featureName = 'test.feature';
        const stepName = 'steps.js';

        this.state = {
            featureName,
            stepName,
            featureSource,
            stepSource
        };

        app.setFeature(1, featureName, featureSource)
            .catch(err => app.logger.error(`${err.name}: ${err.message}\n`));
        app.setStepDefinition(1, stepName, stepSource)
            .catch(err => app.logger.error(`${err.name}: ${err.message}\n`));
    }

    onChangeFeature(featureName, featureSource) {
        app.setFeature(1, featureName, featureSource)
            .then(() => this.setState(() => ({
                featureName, featureSource
            })), err => app.logger.error(`${err.name}: ${err.message}\n`));
    }

    onChangeStep(stepName, stepSource) {
        app.setStepDefinition(1, stepName, stepSource)
            .then(() => this.setState(() => ({
                stepName, stepSource
            })), err => app.logger.error(`${err.name}: ${err.message}\n`));
        }

    render() {
        return (<div className="testrunner-view">
            <SplitPane split="vertical" size="100%">
                <div style={{ height: '100%', width: '100%' }}>
                    <SplitPane split="horizontal" size="100%">
                        <div style={{ height: '100%', width: '100%' }}>
                            <FeatureView id="feature_editor_1" name={this.state.featureName} value={this.state.featureSource} onChange={this.onChangeFeature} />
                        </div>
                        <div style={{ height: '100%', width: '100%' }}>
                            <StepDefinitionView id="step_editor_1" name={this.state.stepName} value={this.state.stepSource} onChange={this.onChangeStep} />
                        </div>
                    </SplitPane>
                </div>
                <div style={{ height: '100%', width: '100%' }}>
                    <OutputView />
                </div>
            </SplitPane>
        </div>);
    }
}
