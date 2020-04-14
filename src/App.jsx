import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { NotificationContainer, NotificationManager } from 'react-notifications';

import app from './app'
import { strings } from '../config';

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