import React from 'react';
import AceEditor from 'react-ace';
import ReactResizeDetector from 'react-resize-detector';

import eventHub from '../eventHub';

import 'ace-builds/src-noconflict/mode-gherkin';
import 'ace-builds/src-noconflict/mode-javascript';

import 'ace-builds/src-noconflict/theme-chrome';
import 'ace-builds/src-noconflict/theme-monokai';

export default
    class Editor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editorHeight: "100%",
            editorWidth: "auto",
            editorTheme: "light"
        }
        this.onResize = this.onResize.bind(this);
        eventHub.on('themeChanged', t => this.setState({ editorTheme: t }));
    }

    getTheme() {
        if (this.state.editorTheme === 'dark') {
            return 'monokai';
        }
        return 'chrome';
    }

    onResize(w, h) {
        this.setState({
            editorHeight: `${h}`,
            editorWidth: `${w}`
        })
    }

    render() {
        return (<div style={{ width: '100%', height: '100%' }}>
            <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} />
            <AceEditor
                mode={this.props.type}
                theme={this.getTheme()}
                fontSize={14}
                showPrintMargin={false}
                onBlur={this.props.onBlur}
                onChange={this.props.onChange}
                height={this.state.editorHeight}
                width={this.state.editorWidth}
                name={this.props.id}
                value={this.props.value}
                useSoftTabs={true}
                editorProps={{
                    hScrollBarAlwaysVisible: false,
                    vScrollBarAlwaysVisible: true,
                    animatedScroll: true,
                }}
            />
        </div>);
    }
}