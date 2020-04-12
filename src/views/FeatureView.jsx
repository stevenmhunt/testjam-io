import React from 'react';
import Dropdown from 'react-dropdown';

import Editor from '../components/Editor.jsx'

import GherkinIndent from '../../lib/gherkin-indent';
import eventHub from '../eventHub';

export default
    class FeatureView extends React.Component {

    constructor(props) {
        super(props);
        
        this.onBlur = this.onBlur.bind(this);
        this.changeRuntime = this.changeRuntime.bind(this);
        this.formatGherkin = this.formatGherkin.bind(this);

        this.indent = new GherkinIndent({});

        this.state = {
            runtime: 'CucumberJS 6.x'
        }

        this.runtimes = eventHub.getRuntimes();

        eventHub.on('runtimeChanged', runtime => this.setState({ runtime }));
    }

    onBlur(e, code) {
        if (this.props && this.props.onChange) {
            this.props.onChange(this.props.name, code.getValue());
        }
    }

    changeRuntime(t) {
        eventHub.setRuntime(t.value);
    }

    formatGherkin() {
        if (this.props && this.props.onChange) {
            this.props.onChange(this.props.name, this.indent.format(code.getValue()));
        }
    }

    render() {
        return (<div className="feature-view">
            <div className="view-header">
                <div className="view-header-left">
                    <div className="title"><div>Feature File</div></div>
                </div>
                <div className="view-header-right">
                    <div className="menu">
                    <a className="btn" title="[Link] Learn more about the Gherkin syntax" target="_blank" href="https://cucumber.io/docs/gherkin/reference/">
                        <i className="fa fa-info-circle"></i>
                    </a>
                    <div onClick={this.formatGherkin} className="btn" title="Format Gherkin"><i className="fa fa-magic"></i></div>
                        <div className="item" title="Runtime">
                            <Dropdown options={this.runtimes} value={this.state.runtime} onChange={this.changeRuntime} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="editor-container">
                <Editor type="gherkin" id={this.props.id} value={this.props.value} onBlur={this.onBlur} />
            </div>
        </div>);
    }
}