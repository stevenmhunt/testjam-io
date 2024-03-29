import React from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import GherkinEditor from '@smartbear/react-gherkin-editor';
import ReactResizeDetector from 'react-resize-detector';

import app from '../app';

import 'ace-builds/src-noconflict/mode-javascript';

import 'ace-builds/src-noconflict/theme-chrome';
import 'ace-builds/src-noconflict/theme-gruvbox';

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
        app.on('themeChanged', (theme) => this.setState({ theme }));
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
            return 'gruvbox';
        }
        return 'chrome';
    }

    render() {
        const useSoftTabs = true;
        const highlightActiveLine = true;
        const hideToolbar = true;
        const showGutter = true;
        const {
            type, onBlur, onChange, id, value, dialect,
        } = this.props;
        const { width, height } = this.state;
        const options = {
            showLineNumbers: true,
        };
        return (
            <div className="editor-outer-container">
                <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} />
                {type === 'gherkin'
                    ? (
                        <GherkinEditor
                            theme={this.getAceTheme()}
                            language={dialect}
                            fontSize={14}
                            showPrintMargin={false}
                            onBlur={onBlur}
                            onChange={onChange}
                            height={height}
                            width={width}
                            name={id}
                            initialValue={value}
                            useSoftTabs={useSoftTabs}
                            hideToolbar={hideToolbar}
                            showGutter={showGutter}
                            highlightActiveLine={highlightActiveLine}
                            setOptions={options}
                            editorProps={{
                                hScrollBarAlwaysVisible: false,
                                vScrollBarAlwaysVisible: true,
                                animatedScroll: true,
                            }}
                        />
                    )
                    : (
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
                    )}
            </div>
        );
    }
}

Editor.propTypes = {
    dialect: PropTypes.string,
    type: PropTypes.string.isRequired,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
};

Editor.defaultProps = {
    dialect: 'en',
};

export default Editor;
