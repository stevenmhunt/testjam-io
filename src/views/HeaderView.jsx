import React from 'react';
import Dropdown from 'react-dropdown';
import Popup from 'reactjs-popup';

import app from '../app';

export default
    class HeaderView extends React.Component {

    constructor(props) {
        super(props);

        this.editName = this.editName.bind(this);
        this.setName = this.setName.bind(this);
        this.setTheme = this.setTheme.bind(this);
        this.runTest = this.runTest.bind(this);
        this.toggleLike = this.toggleLike.bind(this);
        this.signIn = this.signIn.bind(this);
        this.signOut = this.signOut.bind(this);
        this.save = this.save.bind(this);
        this.fork = this.fork.bind(this);

        this.state = {
            theme: app.getTheme(),
            fork: app.getFork(),
            isTestRunning: false,
            isTestEnabled: true,
            isLiked: false,
            isSaving: false,
            isForking: false,
            isSignedIn: false,
            isOwner: false,
            isEditName: false,
            name: '',
            jams: []
        }

        this.themes = app.getThemes();

        app.on('testsStarted', () => this.setState({ isTestRunning: true }));
        app.on('testsEnded', () => this.setState({ isTestRunning: false }));
        app.on('testsDisabled', () => this.setState({ isTestEnabled: false }));
        app.on('testsEnabled', () => this.setState({ isTestEnabled: true }));

        app.on('themeChanged', theme => this.setState(() => ({ theme })));
        app.on('forkChanged', fork => this.setState(() => ({ fork })));

        app.on('liked', () => this.setState({ isLiked: true }));
        app.on('unliked', () => this.setState({ isLiked: false }));

        app.on('signedIn', user => this.setState({ user }));
        app.on('signedOut', () => this.setState({ user: null }));

        app.on('saving', () => this.setState({ isSaving: true }));
        app.on('saved', () => this.setState({ isSaving: false, isNew: false }));

        app.on('forking', () => this.setState({ isForking: true }));
        app.on('forked', () => this.setState({ isForking: false }));

        app.on('ownerChanged', (owner) => {
            if (!owner) {
                return this.setState({ owner, isNew: true });
            }
            return this.setState({ owner, isNew: false });
        });
        app.on('nameChanged', name => this.setState({ name, isEditName: false }));

        // app.getMyJams().then(jams => this.setState({ jams }));
    }

    isOwner() {
        return (this.state.user &&
            this.state.user.uid &&
            this.state.owner &&
            this.state.owner.uid &&
            this.state.user.uid === this.state.owner.uid) || this.state.isNew;
    }

    setTheme(t) {
        app.setTheme(t.value);
    }

    editName() {
        if ((this.isOwner() || this.state.isNew) && !this.state.isEditName) {
            this.setState({
                isEditName: true
            });
        }
    }

    setName(e) {
        app.setName(e.target.value);
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

    fork() {
        if (!this.state.isForking && confirm('This will make a copy of the current jam so that you can make changes and save them yourself. Any changes you\'ve made on this page so far will also be saved into your new jam.\n\nDo you want to continue?')) {
            app.fork();
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
        if (this.state.user && !this.isOwner()) {
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
        if (this.state.user && !this.isOwner()) {
            return <div title="Fork" className="btn btn-fork" onClick={this.fork}>
                {this.state.isForking ?
                    <span><i className="fa fa-spin fa-circle-o-notch"></i></span> :
                    <span><i className="fa fa-code-fork"></i></span>}
            </div>;
        }
        return '';
    }

    renderSaveButton() {
        if (this.state.user && this.isOwner()) {
            return <div title="Save" className="btn btn-save" onClick={this.save}>
                {this.state.isSaving ?
                    <span><i className="fa fa-spin fa-circle-o-notch"></i></span> :
                    <span><i className="fa fa-save"></i></span>}</div>;
        }
        return '';
    }


    renderUserDisplay() {
        return <div className="btn user-info">
            <img src={this.state.user.photoURL} />
            <span className="user-name">{this.state.user.displayName}</span>
            <span className="user-menu"><i className="fa fa-bars"></i></span>
        </div>;
    }

    renderSignInArea() {
        if (this.state.user) {
            return <Popup trigger={this.renderUserDisplay()}
                position="bottom right"
                closeOnDocumentClick
                mouseLeaveDelay={300}
                contentStyle={{ padding: "0px", border: "none" }}
                arrow={false}>
                <div className="Dropdown-menu" aria-expanded="true">
                    <div className="Dropdown-option" onClick={this.signOut}><i className="fa fa-sign-out"></i>&nbsp;&nbsp;Sign Out</div>
                </div>
            </Popup>;
        }
        return <div onClick={this.signIn} className="btn user-signin">Sign In</div>
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
            {/* this.renderLikeButton() */}
            {this.renderForkButton()}
            {this.renderSaveButton()}
            {this.renderSignInArea()}
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
                <a href={window.location.origin} target="_blank" className="btn" title="Create a new jam!">
                    <span><i className="fa fa-plus"></i></span>
                </a>
            </div>
            <div className="header-center">
                {this.state.fork ?
                    (<Popup position="bottom center" on="hover" closeOnDocumentClick closeOnEscape trigger={
                        <div className="item item-fork">
                            <span><i className="fa fa-code-fork"></i></span>
                        </div>}>
                        <div className="fork-tooltip">
                            <div>Forked from <b>{this.state.fork.name}</b>&nbsp;&nbsp;
                            <a href={`${window.location.origin}/?p=${this.state.fork.id}`} target="_blank">
                                    <i className="fa fa-external-link"></i>
                                </a></div>
                            <div className="view-header">
                                <div className="view-header-left">
                                    <div className="item">
                                        <img src={this.state.fork.createdBy.photo} />
                                    </div>
                                    <div className="item">
                                        {this.state.fork.createdBy.name}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Popup>) : ''}
                {this.state.name && this.isOwner() && this.state.isEditName ?
                    <div className="item jam-name jam-name-editable">
                        <input type="text" defaultValue={this.state.name} onBlur={this.setName} />
                    </div> : ''}
                {this.state.name && this.isOwner()&& !this.state.isEditName ?
                    <div className="item jam-name jam-name-editable" onClick={this.editName}>
                        <span style={this.state.isNew ? {fontStyle: 'italic'} : {}}>{this.state.name}</span>
                    </div> : ''}
                {this.state.name && !this.isOwner() ?
                    <div className="item jam-name">
                        <span>{this.state.name}</span>
                    </div> : ''}
                {this.state.owner && !this.isOwner() ?
                    <div className="item jam-info">
                        <img src={this.state.owner.photo} />
                        <span className="user-name">{this.state.owner.name}</span>
                    </div> : ''}
            </div>
            <div className="header-right">
                {this.renderMenu()}
            </div>
        </div>);
    }
}