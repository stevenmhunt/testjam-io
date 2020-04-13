import React from 'react';
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
    result = result.replace(new RegExp(`${protocol}[/]{1,2}${hostname}${port !== 80 || port != 443 ? ':' + port : ''}`, 'g'), '');
    return formatter(result);
}

export default
    class OutputView extends React.Component {

    constructor(props) {
        super(props);

        this.clearOutput = this.clearOutput.bind(this);
        this.copyOutput = this.copyOutput.bind(this);
        this.onCommandKeyDown = this.onCommandKeyDown.bind(this);

        this.state = {
            output: []
        };
        const formatter = props.formatter || (i => i);
        logger.on('output', (data) => {
            this.setState(state => ({
                output: [...state.output, processOutput(data, formatter)]
            }));
            this.scrollToBottom();
        });
        logger.on('clear', () => this.clearOutput());
    }

    scrollToBottom() {
        const element = document.getElementById('outputLogView').parentElement;
        element.scrollTop = element.scrollHeight - element.clientHeight;
    }

    displayHelp() {
        logger.log(`
- Execute tests
test

- Console
help
clear
copy

- Test Runtimes
getRuntimes
getRuntime
setRuntime

- Themes
getThemes
getTheme
setTheme

- Likes
like
unlike

`);
    }

    copyOutput() {
        const copyText = document.getElementById('outputLogView').textContent;
        const textArea = document.createElement('textarea');
        textArea.textContent = `${copyText}\n\nJam on! Another automated test run brought to you by testjam.io`;
        textArea.style.position = 'absolute';
        textArea.style.left = '-100%';
        document.body.append(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
    }

    clearOutput() {
        this.setState({ output: [] });
    }

    onCommandKeyDown(e) {
        if (e.key === 'Enter') {
            if (e.target.value === 'help') {
                this.displayHelp();
            }
            else if (e.target.value === 'copy') {
                this.copyOutput();
            }
            else if (e.target.value === 'clear') {
                this.clearOutput();
            }
            else {
                app.execute(e.target.value);
            }
            e.target.value = '';
        }
    }

    render() {
        return (<div className="output-view">
            <div className="view-header">
                <div className="view-header-left">
                    <div className="title"><div>Test Results</div></div>
                </div>
                <div className="view-header-right">
                    <div className="menu">
                        <div onClick={this.copyOutput} className="btn" title="Copy Output to Clipboard"><i className="fa fa-copy"></i></div>
                        <div onClick={this.clearOutput} className="btn" title="Clear Output"><i className="fa fa-trash"></i></div>
                    </div>
                </div>
            </div>
            <div className="output-container" style={{ overflow: 'auto' }}>
                <pre id="outputLogView" dangerouslySetInnerHTML={{ __html: ansiHtml(this.state.output.join('')) }}></pre>
            </div>
            <div className="view-header">
                <div className="view-header-left" style={{ width: '100%' }}>
                    <div className="title"><div style={{fontSize: '18px'}}><i className="fa fa-terminal"></i></div></div>
                    <div className="item commands">
                        <input autoFocus type="text" className="commands" placeholder="For help with the terminal, type 'help'." onKeyDown={this.onCommandKeyDown} />
                    </div>
                </div>
            </div>
        </div>);
    }
}