import React from 'react';
import Editor from '../components/Editor.jsx';
import { indent } from 'indent.js';

import app from '../app';

export default
    class StepDefinitionView extends React.Component {

    constructor(props) {
        super(props);
        this.onBlur = this.onBlur.bind(this);
        this.formatJS = this.formatJS.bind(this);

        this.state = {
            language: 'javascript',
            name: '',
            source: ''
        };

        app.on('stepDefinitionUpdated', (data) => this.setState(() => data));
    }

    onBlur(e, code) {
        return app.setStepDefinition({ id: 1, name: this.state.name, source: code.getValue() })
            .catch(err => app.logger.error(`${err.name}: ${err.message}\n`));
    }

    formatJS() {
        const source = indent.js(this.state.source, { tabString: '    ' });
        return app.setStepDefinition({ id: 1, name: this.state.name, source })
            .catch(err => app.logger.error(`${err.name}: ${err.message}\n`));
    }

    render() {
        return (<div className="stepdefinition-view">
            <div className="view-header">
                <div className="view-header-left">
                    <div className="title"><div>Step Definitions <i>({this.state.language})</i></div></div>
                </div>
                <div className="view-header-right">
                    <div className="menu">
                        <div onClick={this.formatJS} className="btn" title="Format JavaScript"><i className="fa fa-magic"></i></div>
                    </div>
                </div>
            </div>
            <div className="editor-container">
                <Editor type={this.state.language} id={this.props.id} value={this.state.source} onBlur={this.onBlur} />
            </div>
        </div>);
    }
}