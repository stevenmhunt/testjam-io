import React from 'react';
import Editor from '../components/Editor.jsx'
import Dropdown from 'react-dropdown';
import GherkinIndent from '../../lib/gherkin-indent';

export default
    class FeatureView extends React.Component {

    constructor(props) {
        super(props);
        
        this.onBlur = this.onBlur.bind(this);
        this.formatGherkin = this.formatGherkin.bind(this);

        this.indent = new GherkinIndent({});

        this.state = {
            cucumberVersion: '6.x'
        }

        this.cucumberVersions = [
            '6.x'
        ];
    }

    onBlur(e, code) {
        if (this.props && this.props.onChange) {
            this.props.onChange(this.props.name, code.getValue());
        }
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
                    <a className="btn" title="Learn more about Gherkin" target="_blank" href="https://cucumber.io/docs/gherkin/reference/">
                        <i className="fa fa-external-link"></i>
                    </a>
                    <div onClick={this.formatGherkin} className="btn" title="Format Gherkin"><i className="fa fa-magic"></i></div>
                        <div className="item" title="CucumberJS Version">
                            <Dropdown options={this.cucumberVersions} value={this.state.cucumberVersion} />
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