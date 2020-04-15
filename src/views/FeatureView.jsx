import React from 'react';
import Dropdown from 'react-dropdown';

import Editor from '../components/Editor.jsx'

import GherkinIndent from '../../lib/gherkin-indent';
import app from '../app';

export default
    class FeatureView extends React.Component {

    constructor(props) {
        super(props);
        
        this.onBlur = this.onBlur.bind(this);
        this.changeRuntime = this.changeRuntime.bind(this);
        this.formatGherkin = this.formatGherkin.bind(this);

        this.indent = new GherkinIndent({});

        this.state = {
            runtime: 'CucumberJS 6.x',
            name: '',
            source: ''
        }

        app.on('runtimeChanged', runtime => this.setState({ runtime }));
        app.on('featureUpdated', (data) => this.setState(() => data));

        this.runtimes = app.getRuntimes();
    }

    onBlur(e, code) {
        return app.setFeature({ id: 1, name: this.state.name, source: code.getValue() })
            .catch(err => app.logger.error(`${err.name}: ${err.message}\n`));
    }

    changeRuntime(t) {
        app.setRuntime(t.value);
    }

    formatGherkin() {
        const source = this.indent.format(this.state.source);
        return app.setFeature({ id: 1, name: this.state.name, source })
            .catch(err => app.logger.error(`${err.name}: ${err.message}\n`));
    }

    render() {
        return (<div className="feature-view">
            <div className="view-header">
                <div className="view-header-left">
                    <div className="title"><div>Feature File</div></div>
                </div>
                <div className="view-header-right">
                    <div className="menu">
                    <div onClick={this.formatGherkin} className="btn" title="Format Gherkin"><i className="fa fa-magic"></i></div>
                        <div className="item" title="Runtime">
                            <Dropdown options={this.runtimes} value={this.state.runtime} onChange={this.changeRuntime} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="editor-container">
                <Editor type="gherkin" id={this.props.id} value={this.state.source} onBlur={this.onBlur} />
            </div>
        </div>);
    }
}