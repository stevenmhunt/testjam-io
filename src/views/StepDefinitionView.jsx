import React from 'react';
import Editor from '../components/Editor.jsx'

export default
    class StepDefinitionView extends React.Component {

    constructor(props) {
        super(props);
        this.onBlur = this.onBlur.bind(this);
    }

    onBlur(e, code) {
        if (this.props && this.props.onChange) {
            this.props.onChange(this.props.name, code.getValue());
        }
    }

    render() {
        return (<div className="stepdefinition-view">
            <div className="view-header">
                <div className="view-header-left">
                    <div className="title"><div>Step Definitions</div></div>
                </div>
                <div className="view-header-right">
                    <div className="menu">
                    <div className="btn" title="Format JavaScript"><i className="fa fa-magic"></i></div>
                    <div className="btn" title="Configure"><i className="fa fa-gear"></i></div>
                    </div>
                </div>
            </div>
            <div className="editor-container">
                <Editor type="javascript" id={this.props.id} value={this.props.value} onBlur={this.onBlur} />
            </div>
        </div>);
    }
}