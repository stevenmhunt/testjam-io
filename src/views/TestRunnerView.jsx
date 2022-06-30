import React from 'react';
import SplitPane from 'react-split-pane';

import OutputView from './OutputView.jsx';
import FeatureView from './FeatureView.jsx';
import StepDefinitionView from './StepDefinitionView.jsx';

export default
    class TestRunnerView extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<div className="testrunner-view">
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
        </div>);
    }
}
