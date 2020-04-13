import React from 'react';
import Dropdown from 'react-dropdown';

import app from '../app';

export default
    class HeaderView extends React.Component {

    constructor(props) {
        super(props);

        this.changeTheme = this.setTheme.bind(this);
        this.runTest = this.runTest.bind(this);
        this.toggleLike = this.toggleLike.bind(this);
        this.signIn = this.signIn.bind(this);

        this.state = {
            theme: app.getTheme(),
            isTestRunning: false,
            isTestEnabled: true,
            isLiked: false,
            isSignedIn: false
        }

        this.themes = app.getThemes();

        app.on('testsStarted', () => this.setState({ isTestRunning: true }));
        app.on('testsEnded', () => this.setState({ isTestRunning: false }));
        app.on('testsDisabled', () => this.setState({ isTestEnabled: false }));
        app.on('testsEnabled', () => this.setState({ isTestEnabled: true }));
        app.on('themeChanged', theme => this.setState(() => ({ theme })));
        app.on('liked', () => this.setState({ isLiked: true }));
        app.on('unliked', () => this.setState({ isLiked: false }));
        app.on('signedIn', user => this.setState({ user }));
        app.on('signedOut', () => this.setState({ user: null }));
    }

    setTheme(t) {
        app.setTheme(t.value);
    }

    runTest() {
        app.test();
    }

    toggleLike() {
        if (this.state.isLiked) {
            app.unlike();
        }
        else {
            app.like();
        }
    }

    signIn() {
        app.signIn();
    }

    renderTestButton() {
        let innerButton = <span>&nbsp;<i className="fa fa-play-circle"></i>&nbsp;&nbsp;Run Tests</span>;
        let buttonClass = "btn btn-run";
        if (this.state.isTestRunning) {
            innerButton = <span>&nbsp;<i className="fa fa-spin fa-circle-o-notch"></i>&nbsp;Running...</span>;
            buttonClass = "btn btn-running";
        }
        else if (!this.state.isTestEnabled) {
            innerButton = <span>&nbsp;<i className="fa fa-ban"></i>&nbsp;&nbsp;Run Tests</span>;
            buttonClass = "btn btn-norun";
        }
        return <div className={buttonClass} onClick={this.runTest}>{innerButton}</div>;
    }

    renderMenu() {
        if (this.state.user) {
            return <div className="menu">
                <div className="item" title="Theme" style={{ marginRight: '6px' }}>
                    <Dropdown options={this.themes} value={this.state.theme} onChange={this.setTheme} />
                </div>
                {this.renderTestButton()}
                <div className={this.state.isLiked ? "btn btn-liked" : "btn btn-unliked"} onClick={this.toggleLike}>
                    {this.state.isLiked ?
                        <span>&nbsp;<i className="fa fa-heart"></i></span> :
                        <span>&nbsp;<i className="fa fa-heart-o"></i></span>}
                </div>
                <div className="btn btn-fork"><span><i className="fa fa-code-fork"></i></span></div>
                <div className="btn btn-save"><span><i className="fa fa-save"></i></span></div>
                <div className="btn"><img className="user-photo" src={this.state.user.photoURL} />&nbsp;&nbsp;&nbsp;{this.state.user.displayName}</div>
            </div>;
        }
        return <div className="menu">
            <div className="item" title="Theme" style={{ marginRight: '6px' }}>
                <Dropdown options={this.themes} value={this.state.theme} onChange={this.setTheme} />
            </div>
            {this.renderTestButton()}
            <div onClick={this.signIn} className="btn">Sign In</div>
        </div>;
    }

    render() {
        return (<div className="header-view">
            <div className="header-left">
                <div className="logo">
                    <img src="/images/cucumber.png" />
                </div>
                <div className="title">
                    <div title="Jam on!" style={{ cursor: "grab" }}>testjam</div>
                </div>
            </div>
            <div className="header-right">
                {this.renderMenu()}
            </div>
        </div>);
    }
}