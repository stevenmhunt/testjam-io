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
            <Editor type="javascript" id={this.props.id} value={this.props.value} onBlur={this.onBlur} />
        </div>);
    }
}