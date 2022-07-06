import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { NotificationManager } from 'react-notifications';
import app from './app';
import { strings } from '../config';
import TestRunnerView from './views/TestRunnerView';
import HeaderView from './views/HeaderView';

const { build } = require('../package.json');

class App extends React.Component {
    constructor(props) {
        super(props);

        const WAIT = 1500;

        app.on('saved', (id) => NotificationManager.success(
            strings.notifications.changesSaved[id ? 'messageNew' : 'messageExisting'],
            strings.notifications.changesSaved.title,
            WAIT,
        ));

        app.on('testsEnded', (err) => {
            if (err) {
                NotificationManager.error('Test failures occurred while executing your scenarios.', 'Test failure', WAIT);
            }
        });
    }

    render() {
        return (
            <Router>
                <div className="app-container">
                    <HeaderView />
                    <TestRunnerView />
                    <div className="footer">
                        <div className="item-left">
                            The
                            {' '}
                            <a href="https://github.com/cucumber-ltd/brand/blob/master/images/png/notm/cucumber-mark-green/cucumber-mark-green-32.png" target="_blank" rel="noreferrer">Cucumber logo</a>
                            {' '}
                            by&nbsp;
                            <a href="https://github.com/cucumber-ltd" target="_blank" rel="noreferrer">Cucumber Ltd</a>
                            {' '}
                            is licensed under&nbsp;
                            <a href="https://creativecommons.org/licenses/by-nc/3.0/" target="_blank" rel="noreferrer">CC BY-NC 3.0</a>
&nbsp;
                            [
                            <a href="https://github.com/cucumber-ltd/brand/blob/master/LICENSE" target="_blank" rel="noreferrer">^</a>
                            ]
                        </div>
                        <div className="item-right">
                            v
                            {build.version}
&nbsp;&nbsp;&nbsp;
                            <a href="https://github.com/stevenmhunt/testjam-io" target="_blank" rel="noreferrer">View Source</a>
&nbsp;&nbsp;&nbsp;
                            <a href="/docs/privacy.html" target="_blank">Privacy Policy</a>
&nbsp;&nbsp;&nbsp;
                            <a href="/docs/terms.html" target="_blank">Terms of Service</a>
&nbsp;
                        </div>
                    </div>
                </div>
            </Router>
        );
    }
}

render(<App />, document.getElementById('app'));

app.on('themeChanged', (t) => {
    document.getElementsByTagName('body')[0].className = `app-page theme-${t}`;
});
