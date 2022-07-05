import React from 'react';
import AceEditor from 'react-ace';
import GherkinEditor from '@smartbear/react-gherkin-editor'
import ReactResizeDetector from 'react-resize-detector';

import app from '../app';

import 'ace-builds/src-noconflict/mode-javascript';

import 'ace-builds/src-noconflict/theme-chrome';
import 'ace-builds/src-noconflict/theme-monokai';

/**
 * @class
 * Code editor component.
 */
export default
    class Editor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            width: "auto",
            height: "100%",
            theme: "Light"
        }
        this.onResize = this.onResize.bind(this);
        app.on('themeChanged', t => this.setState({ theme: t }));
    }

    /**
     * Based on the current theme, determine which Ace editor theme to use.
     */
    getAceTheme() {
        if (this.state.theme === 'Dark') {
            return 'monokai';
        }
        return 'chrome';
    }

    /**
     * Handles resize events to keep the editor functioning when sizes change.
     */
    onResize(w, h) {
        this.setState({
            width: `${w}`,
            height: `${h}`
        })
    }

    render() {
        return (<div style={{ width: '100%', height: '100%' }}>
            <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} />
            {this.props.type === 'gherkin' ?
            <GherkinEditor
                theme={this.getAceTheme()}
                language='en'
                fontSize={14}
                showPrintMargin={false}
                onBlur={this.props.onBlur}
                onChange={this.props.onChange}
                height={this.state.height}
                width={this.state.width}
                name={this.props.id}
                initialValue={this.props.value}
                useSoftTabs={true}
                editorProps={{
                    hScrollBarAlwaysVisible: false,
                    vScrollBarAlwaysVisible: true,
                    animatedScroll: true,
                }}
            />
            :
            <AceEditor
                mode={this.props.type}
                theme={this.getAceTheme()}
                fontSize={14}
                showPrintMargin={false}
                onBlur={this.props.onBlur}
                onChange={this.props.onChange}
                height={this.state.height}
                width={this.state.width}
                name={this.props.id}
                value={this.props.value}
                useSoftTabs={true}
                editorProps={{
                    hScrollBarAlwaysVisible: false,
                    vScrollBarAlwaysVisible: true,
                    animatedScroll: true,
                }}
            />}
        </div>);
    }
}