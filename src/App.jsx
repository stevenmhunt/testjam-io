import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { NotificationContainer, NotificationManager } from 'react-notifications';

import app from './app'
import { strings } from '../config';
const { build } = require('../package.json');

import TestRunnerView from './views/TestRunnerView.jsx';
import HeaderView from './views/HeaderView.jsx';

class App extends React.Component {
    constructor(props) {
        super(props);

        const WAIT = 1500;

        app.on('saved', id => NotificationManager.success(
            strings.notifications.changesSaved[id ? 'messageNew' : 'messageExisting'],
            strings.notifications.changesSaved.title, WAIT));

        app.on('testsEnded', err => {
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
                            The <a href="https://github.com/cucumber-ltd/brand/blob/master/images/png/notm/cucumber-mark-green/cucumber-mark-green-32.png" target="_blank">Cucumber logo</a> by&nbsp; 
                            <a href="https://github.com/cucumber-ltd" target="_blank">Cucumber Ltd</a> is licensed under&nbsp;
                            <a href="https://creativecommons.org/licenses/by-nc/3.0/" target="_blank">CC BY-NC 3.0</a>
                            [<a href="https://github.com/cucumber-ltd/brand/blob/master/LICENSE" target="_blank">^</a>]
                        </div>
                        <div className="item-right">
                            testjam.io version {build.version}
                        </div>
                    </div>
                    <NotificationContainer />
                </div>
            </Router>
        );
    }
}

render(<App />, document.getElementById('app'));    

app.on('themeChanged', (t) => {
    document.getElementsByTagName('body')[0].className = `app-page theme-${t}`;
});