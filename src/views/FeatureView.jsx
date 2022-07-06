import React from 'react';
import Dropdown from 'react-dropdown';
import Editor from '../components/Editor';
import GherkinIndent from '../../lib/gherkin-indent';
import app from '../app';

export default class FeatureView extends React.Component {
    constructor(props) {
        super(props);

        this.onBlur = this.onBlur.bind(this);
        this.changeRuntime = this.changeRuntime.bind(this);
        this.changeDialect = this.changeDialect.bind(this);
        this.formatGherkin = this.formatGherkin.bind(this);

        this.indent = new GherkinIndent({});

        this.state = {
            runtime: 'CucumberJS 8.x',
            dialect: 'en',
            name: '',
            source: '',
        };

        app.on('runtimeChanged', (runtime) => this.setState({ runtime }));
        app.on('dialectChanged', (dialect) => this.setState({ dialect }));
        app.on('featureUpdated', (source) => this.setState(() => source));

        this.runtimes = app.getRuntimes();
        this.dialects = app.getDialects();
    }

    onBlur(e, code) {
        const { name } = this.state;
        return app.setFeature({ id: 1, name, source: code.getValue() })
            .catch((err) => app.logger.error(`${err.name}: ${err.message}\n`));
    }

    // eslint-disable-next-line class-methods-use-this
    changeRuntime(t) {
        app.setRuntime(t.value);
    }

    // eslint-disable-next-line class-methods-use-this
    changeDialect(d) {
        app.setDialect(d.value);
    }

    formatGherkin() {
        const { name, source: sourceInitial } = this.state;
        const source = this.indent.format(sourceInitial);
        return app.setFeature({ id: 1, name, source })
            .catch((err) => app.logger.error(`${err.name}: ${err.message}\n`));
    }

    render() {
        // eslint-disable-next-line react/prop-types
        const { id } = this.props;
        const { runtime, source, dialect } = this.state;
        return (
            <div className="feature-view">
                <div className="view-header">
                    <div className="view-header-left">
                        <div className="title"><div>Feature File</div></div>
                    </div>
                    <div className="view-header-right">
                        <div className="menu">
                            <div onClick={this.formatGherkin} onKeyDown={app.handleEnter(this.formatGherkin)} role="button" tabIndex={0} className="btn btn-small">
                                <i className="fa fa-magic" />
                                Tidy
                            </div>
                            <div className="item" title="Dialect">
                                <Dropdown
                                    options={this.dialects}
                                    value={dialect}
                                    onChange={this.changeDialect}
                                />
                            </div>
                            <div className="item" title="Runtime">
                                <Dropdown
                                    options={this.runtimes}
                                    value={runtime}
                                    onChange={this.changeRuntime}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="editor-container">
                    <Editor type="gherkin" dialect={dialect} id={id} value={source} onBlur={this.onBlur} />
                </div>
            </div>
        );
    }
}
