import React from 'react';
import ansiHtml from 'ansi-html';

function processOutput(output, formatter) {
    const { protocol, hostname, port } = window.location;
    let result = output;
    result = result.replace(new RegExp(`${protocol}[/]{1,2}${hostname}${port !== 80 || port != 443 ? ':' + port : ''}`, 'g'), '');
    return formatter(result);
}

export default
class OutputView extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            output: []
        };
        const formatter = props.formatter || (i => i);
        if (props.logger && props.logger.on) {
            props.logger.on('output', data => this.setState({ output: this.state.output.concat([processOutput(data, formatter)]) }));
            props.logger.on('clear', () => this.setState({ output: [] }));
        }        
    }

    render () {
        return (<div className="output-view">
            <pre dangerouslySetInnerHTML={{__html: ansiHtml(this.state.output.join('')) }}></pre>
        </div>);
    }
}