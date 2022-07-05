import React from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import ReactResizeDetector from 'react-resize-detector';

import app from '../app';

import 'ace-builds/src-noconflict/mode-gherkin';
import 'ace-builds/src-noconflict/mode-javascript';

import 'ace-builds/src-noconflict/theme-chrome';
import 'ace-builds/src-noconflict/theme-monokai';

/**
 * @class
 * Code editor component.
 */
class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            width: 'auto',
            height: '100%',
            theme: 'Light',
        };
        this.onResize = this.onResize.bind(this);
        app.on('themeChanged', (t) => this.setState({ theme: t }));
    }

    /**
     * Handles resize events to keep the editor functioning when sizes change.
     */
    onResize(w, h) {
        this.setState({
            width: `${w}`,
            height: `${h}`,
        });
    }

    /**
     * Based on the current theme, determine which Ace editor theme to use.
     */
    getAceTheme() {
        const { theme } = this.state;
        if (theme === 'Dark') {
            return 'monokai';
        }
        return 'chrome';
    }

    render() {
        const useSoftTabs = true;
        const {
            type, onBlur, onChange, id, value,
        } = this.props;
        const { width, height } = this.state;
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} />
                <AceEditor
                    mode={type}
                    theme={this.getAceTheme()}
                    fontSize={14}
                    showPrintMargin={false}
                    onBlur={onBlur}
                    onChange={onChange}
                    height={height}
                    width={width}
                    name={id}
                    value={value}
                    useSoftTabs={useSoftTabs}
                    editorProps={{
                        hScrollBarAlwaysVisible: false,
                        vScrollBarAlwaysVisible: true,
                        animatedScroll: true,
                    }}
                />
            </div>
        );
    }
}

Editor.propTypes = {
    type: PropTypes.string.isRequired,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
};

export default Editor;
