/* eslint-disable react/sort-comp */
import React from 'react';
import Dropdown from 'react-dropdown';
import PropTypes from 'prop-types';
import { indent } from 'indent.js';
import Editor from '../components/Editor';

import app from '../app';

class StepDefinitionView extends React.Component {
    constructor(props) {
        super(props);

        this.onBlur = this.onBlur.bind(this);
        this.changeLanguage = this.changeLanguage.bind(this);
        this.formatJS = this.formatJS.bind(this);

        this.state = {
            language: 'javascript',
            name: '',
            source: '',
        };

        this.languages = app.getLanguages();

        app.on('stepDefinitionUpdated', (data) => this.setState(() => data));
    }

    // eslint-disable-next-line class-methods-use-this
    changeLanguage(t) {
        app.setLanguage(t.value);
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
                            </div>
                        </div>
                    </div>
                    <div className="view-header-right">
                        <div className="menu">
                            <div onClick={this.formatJS} onKeyDown={app.handleEnter(this.formatJS)} role="button" tabIndex={0} className="btn btn-small">
                                <i className="fa fa-magic" />
                                Tidy
                            </div>
                            <div className="item" title="Language">
                                <Dropdown
                                    options={this.languages}
                                    value={language}
                                    onChange={this.changeLanguage}
                                />
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
