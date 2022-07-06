import React from 'react';
import PropTypes from 'prop-types';
import { indent } from 'indent.js';
import Editor from '../components/Editor';

import app from '../app';

class StepDefinitionView extends React.Component {
    constructor(props) {
        super(props);
        this.onBlur = this.onBlur.bind(this);
        this.formatJS = this.formatJS.bind(this);

        this.state = {
            language: 'javascript',
            name: '',
            source: '',
        };

        app.on('stepDefinitionUpdated', (data) => this.setState(() => data));
    }

    onBlur(e, code) {
        const { name } = this.state;
        return app.setStepDefinition({ id: 1, name, source: code.getValue() })
            .catch((err) => app.logger.error(`${err.name}: ${err.message}\n`));
    }

    formatJS() {
        const { name, source: sourceInitial } = this.state;
        const source = indent.js(sourceInitial, { tabString: '    ' });
        return app.setStepDefinition({ id: 1, name, source })
            .catch((err) => app.logger.error(`${err.name}: ${err.message}\n`));
    }

    render() {
        const { language, source } = this.state;
        const { id } = this.props;
        return (
            <div className="stepdefinition-view">
                <div className="view-header">
                    <div className="view-header-left">
                        <div className="title">
                            <div>
                                Step Definitions
                                <i>
                                    (
                                    {language}
                                    )
                                </i>
                            </div>
                        </div>
                    </div>
                    <div className="view-header-right">
                        <div className="menu">
                            <div onClick={this.formatJS} role="button" tabIndex={0} className="btn btn-small">
                                <i className="fa fa-magic" />
                                Tidy
                            </div>
                        </div>
                    </div>
                </div>
                <div className="editor-container">
                    <Editor type={language} id={id} value={source} onBlur={this.onBlur} />
                </div>
            </div>
        );
    }
}

StepDefinitionView.propTypes = {
    id: PropTypes.string.isRequired,
};

export default StepDefinitionView;
