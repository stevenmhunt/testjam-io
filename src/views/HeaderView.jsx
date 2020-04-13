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
        this.signOut = this.signOut.bind(this);
        this.save = this.save.bind(this);

        this.state = {
            theme: app.getTheme(),
            isTestRunning: false,
            isTestEnabled: true,
            isLiked: false,
            isSaving: false,
            isSignedIn: false,
            isOwner: false
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

        app.on('saving', () => this.setState({ isSaving: true }));
        app.on('saved', () => this.setState({ isSaving: false }));

        app.on('jamChanged', (jam) => {
            if (!jam) {
                return this.setState({ isNew: true });
            }
            return this.setState({ owner: jam.uid, isNew: false });
        });
    }

    isOwner() {
        return this.state.user && 
            this.state.user.uid && 
            this.state.owner && 
            this.state.user.uid === this.state.owner;
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

    signOut() {
        app.signOut();
    }

    save() {
        if (!this.state.isSaving) {
            app.save();
        }
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

    renderLikeButton() {
        if (this.state.user && !this.state.isNew && !this.isOwner()) {
            return <div 
                className={this.state.isLiked ? "btn btn-liked" : "btn btn-unliked"}
                title={this.state.isLiked ? "Unlike" : "Like"}
                onClick={this.toggleLike}>
                {this.state.isLiked ?
                    <span>&nbsp;<i className="fa fa-heart"></i></span> :
                    <span>&nbsp;<i className="fa fa-heart-o"></i></span>}
            </div>;
        }
        return '';
    }

    renderForkButton() {
        if (this.state.user && !this.state.isNew) {
            return <div title="Fork" className="btn btn-fork"><span><i className="fa fa-code-fork"></i></span></div>;
        }
        return '';
    }

    renderSaveButton() {
        if (this.state.user && (this.state.isNew || this.isOwner())) {
            let button = <span><i className="fa fa-save"></i></span>;
            if (this.state.isSaving) {
                button = <span><i className="fa fa-spin fa-circle-o-notch"></i></span>;
            }

            return <div title="Save" className="btn btn-save" onClick={this.save}>{button}</div>;
        }
        return '';
    }

    renderUserInfo() {
        if (this.state.user) {
            return <div className="item">
                <img className="user-photo" src={this.state.user.photoURL} />
                &nbsp;&nbsp;&nbsp;{this.state.user.displayName}
            </div>;
        }
        return <div onClick={this.signIn} className="btn">Sign In</div>
    }

    renderOptionsButton() {
        if (this.state.user) {
            return <div title="Settings" className="btn" onClick={this.signOut}>
                <span><i className="fa fa-bars"></i></span>
            </div>
        }
        return '';
    }

    renderMenu() {
        return <div className="menu">
            <div className="item" title="Theme" style={{ marginRight: '6px' }}>
                <Dropdown options={this.themes} value={this.state.theme} onChange={this.setTheme} />
            </div>
            {this.renderTestButton()}
            {this.renderLikeButton()}
            {this.renderForkButton()}
            {this.renderSaveButton()}
            {this.renderUserInfo()}
            {this.renderOptionsButton()}
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