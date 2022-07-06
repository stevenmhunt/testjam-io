import React from 'react';
import SplitPane from 'react-split-pane';

import OutputView from './OutputView';
import FeatureView from './FeatureView';
import StepDefinitionView from './StepDefinitionView';

export default class TestRunnerView extends React.Component {
    render() {
        return (
            <div className="testrunner-view">
                <SplitPane split="vertical" size="100%">
                    <div style={{ height: '100%', width: '100%' }}>
                        <SplitPane split="horizontal" size="100%">
                            <div style={{ height: '100%', width: '100%' }}>
                                <FeatureView id="feature_editor_1" />
                            </div>
                            <div style={{ height: '100%', width: '100%' }}>
                                <StepDefinitionView id="step_editor_1" />
                            </div>
                        </SplitPane>
                    </div>
                    <div style={{ height: '100%', width: '100%' }}>
                        <OutputView />
                    </div>
                </SplitPane>
            </div>
        );
    }
}
