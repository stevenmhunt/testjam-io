import React from 'react';
import Editor from '../components/Editor.jsx';
import { indent } from 'indent.js';

export default
    class StepDefinitionView extends React.Component {

    constructor(props) {
        super(props);
        this.onBlur = this.onBlur.bind(this);
        this.formatJS = this.formatJS.bind(this);

        this.state = {
            language: 'javascript'
        };

        this.editorValue = props.value;
    }

    onBlur(e, code) {
        if (this.props && this.props.onChange) {
            this.editorValue = code.getValue();
            this.props.onChange(this.props.name, this.editorValue);
        }
    }

    formatJS() {
        if (this.props && this.props.onChange) {
            this.props.onChange(this.props.name, indent.js(this.editorValue, { tabString: '    ' }));
        }
    }

    render() {
        return (<div className="stepdefinition-view">
            <div className="view-header">
                <div className="view-header-left">
                    <div className="title"><div>Step Definitions <i>({this.state.language})</i></div></div>
                </div>
                <div className="view-header-right">
                    <div className="menu">
                        <a className="btn" title="[Link] Learn more about step definitions" target="_blank" href="https://cucumber.io/docs/cucumber/step-definitions/">
                            <i className="fa fa-info-circle"></i>
                        </a>
                        <div onClick={this.formatJS} className="btn" title="Format JavaScript"><i className="fa fa-magic"></i></div>
                    </div>
                </div>
            </div>
            <div className="editor-container">
                <Editor type={this.state.language} id={this.props.id} value={this.props.value} onBlur={this.onBlur} />
            </div>
        </div>);
    }
}