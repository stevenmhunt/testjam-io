/* eslint-disable react/no-danger */
/* eslint-disable jsx-a11y/no-autofocus */
import React from 'react';
import PropTypes from 'prop-types';
import { NotificationManager } from 'react-notifications';
import ansiHtml from 'ansi-html';
import _ from 'lodash';

import app from '../app';

const { logger } = app;

function processOutput(output, formatter) {
    if (!output || output === true) {
        return '';
    }

    if (_.isObject(output)) {
        return JSON.stringify(output, null, 4);
    }

    const { protocol, hostname, port } = window.location;
    let result = `${output}`;
    result = result.replace(new RegExp(`${protocol}[/]{1,2}${hostname}${port !== 80 || port !== 443 ? `:${port}` : ''}`, 'g'), '');
    return formatter(result);
}

class OutputView extends React.Component {
    constructor(props) {
        super(props);

        this.clearOutput = this.clearOutput.bind(this);
        this.copyOutput = this.copyOutput.bind(this);
        this.onCommandKeyDown = this.onCommandKeyDown.bind(this);

        this.state = {
            output: [],
        };
        const formatter = props.formatter || ((i) => i);
        logger.on('output', (data) => {
            this.setState((state) => ({
                output: [...state.output, processOutput(data, formatter)],
            }));
            this.scrollToBottom();
        });
        logger.on('clear', () => this.clearOutput());
    }

    // eslint-disable-next-line class-methods-use-this, react/sort-comp
    scrollToBottom() {
        const element = document.getElementById('outputLogView').parentElement;
        element.scrollTop = element.scrollHeight - element.clientHeight;
    }

    // eslint-disable-next-line class-methods-use-this
    displayHelp() {
        logger.log(`

Welcome to the testjam.io command-line environment.

User authentication
   signIn
   signOut

Managing the tests
   test
   getName
   setName {name}
   save
   fork

Configuring the runtime environment
   getRuntime
   setRuntime "{name}"

Configuring package dependencies
   getPackages
   addPackage {name} {version}
   removePackage {name}

Themes
   getTheme
   setTheme {theme}

Command-line utilities
   help
   clear
   copy
`);
    }

    // eslint-disable-next-line class-methods-use-this
    copyOutput() {
        const copyText = document.getElementById('outputLogView').textContent;
        const textArea = document.createElement('textarea');
        textArea.textContent = `${copyText}\n\nThe test result is brought to you by testjam.io`;
        textArea.style.position = 'absolute';
        textArea.style.left = '-100%';
        document.body.append(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        NotificationManager.info('The test log output is now on your computer\'s clipboard.', 'Copy operation completed.', 1500);
    }

    clearOutput() {
        this.setState({ output: [] });
    }

    onCommandKeyDown(e) {
        if (e.key === 'Enter') {
            if (e.target.value === 'help') {
                this.displayHelp();
            } else if (e.target.value === 'copy') {
                this.copyOutput();
            } else if (e.target.value === 'clear') {
                this.clearOutput();
            } else {
                app.execute(e.target.value);
            }
            e.target.value = '';
        }
    }

    render() {
        const { output } = this.state;
        return (
            <div className="output-view">
                <div className="view-header">
                    <div className="view-header-left">
                        <div className="title"><div>Test Results</div></div>
                    </div>
                    <div className="view-header-right">
                        <div className="menu">
                            <div onClick={this.copyOutput} role="button" tabIndex={0} className="btn btn-small">
                                <i className="fa fa-1x fa-clipboard" />
                                Copy
                            </div>
                            <div onClick={this.clearOutput} role="button" tabIndex={0} className="btn btn-small">
                                <i className="fa fa-1x fa-times" />
                                Clear Logs
                            </div>
                        </div>
                    </div>
                </div>
                <div className="output-container" style={{ overflow: 'auto' }}>
                    <pre id="outputLogView" dangerouslySetInnerHTML={{ __html: ansiHtml(output.join('')) }} />
                </div>
                <div className="view-header" style={{ height: '33px' }}>
                    <div className="view-header-left" style={{ width: '100%' }}>
                        <div className="title"><div style={{ fontSize: '18px' }}><i className="fa fa-terminal" /></div></div>
                        <div className="item commands">
                            <input autoFocus type="text" className="commands" placeholder="For help with the terminal, type 'help'." />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

OutputView.propTypes = {
    formatter: PropTypes.func,
};

OutputView.defaultProps = {
    formatter: (i) => i,
};

export default OutputView;
