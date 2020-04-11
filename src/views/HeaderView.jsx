import React from 'react';
import eventHub from '../eventHub';

export default
    class HeaderView extends React.Component {

    onRunTests() {
        eventHub.runTests();
    }

    render() {
        return (<div className="header-view">
            <div className="header-left">
                <div className="logo">
                    <img src="/images/cucumber.png" />
                </div>
                <div className="title">
                    <div>testjam.io</div>
                </div>
            </div>
            <div className="header-right">
                <div className="menu">
                    <div className="btn btn-run" onClick={this.onRunTests.bind(this)}>&nbsp;<i className="fa fa-play-circle"></i>&nbsp;&nbsp;Run Tests</div>
                </div>
            </div>
        </div>);
    }
}