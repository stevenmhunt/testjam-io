import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import eventHub from './eventHub'

import TestRunnerView from './views/TestRunnerView.jsx';
import HeaderView from './views/HeaderView.jsx';

class App extends React.Component {
    render() {
        return (
            <Router>
                <div className="app-container">
                    <HeaderView />
                    <TestRunnerView />
                </div>
            </Router>
        );
    }
}

render(<App />, document.getElementById('app'));    

eventHub.on('themeChanged', (t) => {
    document.getElementsByTagName('body')[0].className = `app-page theme-${t}`;
});