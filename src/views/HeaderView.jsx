/* eslint-disable max-len */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-nested-ternary */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/sort-comp */
import React from 'react';
import { NotificationManager } from 'react-notifications';
import Dropdown from 'react-dropdown';
import Popup from 'reactjs-popup';

import app from '../app';

const { build } = require('../../package.json');

const setImmediate = (fn) => setTimeout(fn, 0);

export default class HeaderView extends React.Component {
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
        this.copyLink = this.copyLink.bind(this);

        this.state = {
            theme: app.getTheme(),
            fork: app.getFork(),
            isTestRunning: false,
            isTestEnabled: true,
            isLiked: false,
            isSaving: false,
            isForking: false,
            isEditName: false,
            name: '',
            isMyJamsLoading: true,
            myJams: [],
            user: {},
        };

        this.themes = app.getThemes();

        app.on('testsStarted', () => this.setState({ isTestRunning: true }));
        app.on('testsEnded', () => this.setState({ isTestRunning: false }));
        app.on('testsDisabled', () => this.setState({ isTestEnabled: false }));
        app.on('testsEnabled', () => this.setState({ isTestEnabled: true }));

        app.on('themeChanged', (theme) => this.setState(() => ({ theme })));
        app.on('forkChanged', (fork) => this.setState(() => ({ fork })));

        app.on('changingLike', () => this.setState({ likeChanging: true }));
        app.on('liked', () => this.setState({ isLiked: true, likeChanging: false }));
        app.on('unliked', () => this.setState({ isLiked: false, likeChanging: false }));

        app.on('signedIn', (user) => this.setState({ user }));
        app.on('signedOut', () => this.setState({ user: {} }));

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
        app.on('nameChanged', (name) => this.setState({ name, isEditName: false }));

        app.on('myJamsLoaded', (myJams) => this.setState({ myJams, isMyJamsLoading: false }));
    }

    isOwner() {
        const { user, owner, isNew } = this.state;
        return (user.uid && owner && owner.uid && user.uid === owner.uid) || isNew;
    }

    setTheme(t) {
        app.setTheme(t.value);
    }

    editName() {
        const { isNew, isEditName } = this.state;
        if ((this.isOwner() || isNew) && !isEditName) {
            this.setState({
                isEditName: true,
            });
        }
    }

    copyLink() {
        document.getElementById('shareLinkText').select();
        document.execCommand('copy');
        NotificationManager.info('A shareable link is now on your computer\'s clipboard.', 'Copy operation completed.', 1500);
    }

    setName(e) {
        app.setName(e.target.value);
    }

    runTest() {
        app.run();
    }

    toggleLike() {
        const { likeChanging, isLiked } = this.state;
        if (!likeChanging) {
            if (isLiked) {
                app.unlike();
            } else {
                app.like();
            }
        }
    }

    signIn() {
        app.signIn();
    }

    signOut() {
        app.signOut();
    }

    save() {
        const { isSaving } = this.state;
        if (!isSaving) {
            app.save();
        }
    }

    fork() {
        const { isForking } = this.state;
        // eslint-disable-next-line no-restricted-globals, no-alert
        const allowFork = confirm('This will make a copy of the current jam so that you can make changes and save them yourself. Any changes you\'ve made on this page so far will also be saved into your new jam.\n\nDo you want to continue?');
        if (!isForking && allowFork) {
            app.fork();
        }
    }

    loadMyJams() {
        app.getMyJams();
    }

    renderTestButton() {
        let innerButton = (
            <span>
                <i className="fa fa-play-circle" />
&nbsp;&nbsp;Run Tests
            </span>
        );
        let buttonClass = 'btn btn-run';
        const { isTestRunning, isTestEnabled } = this.state;
        if (isTestRunning) {
            innerButton = (
                <span>
                    <i className="fa fa-spin fa-circle-o-notch" />
&nbsp;Running...
                </span>
            );
            buttonClass = 'btn btn-running';
        } else if (!isTestEnabled) {
            innerButton = (
                <span>
                    <i className="fa fa-ban" />
&nbsp;&nbsp;Run Tests
                </span>
            );
            buttonClass = 'btn btn-norun';
        }
        return <div className={buttonClass} role="button" tabIndex={0} onClick={this.runTest} onKeyDown={app.handleEnter(this.runTest)}>{innerButton}</div>;
    }

    renderLikeButton() {
        const { user, isLiked, likeChanging } = this.state;
        if (user.uid && !this.isOwner()) {
            return (
                <div
                    className={isLiked ? 'btn btn-liked' : 'btn btn-unliked'}
                    title={isLiked ? 'Unlike' : 'Like'}
                    onClick={this.toggleLike}
                    onKeyDown={app.handleEnter(this.toggleLike)}
                    role="button"
                    tabIndex={0}
                >
                    {likeChanging
                        ? <span><i className="fa fa-spin fa-circle-o-notch" /></span>
                        : isLiked
                            ? <span><i className="fa fa-heart" /></span>
                            : <span><i className="fa fa-heart-o" /></span>}
                </div>
            );
        }
        return '';
    }

    renderForkButton() {
        const { user, isForking } = this.state;
        if (user.uid) {
            return (
                <div title="Fork" className="btn btn-fork" onClick={this.fork} onKeyDown={app.handleEnter(this.fork)} role="button" tabIndex={0}>
                    {isForking
                        ? <span><i className="fa fa-spin fa-circle-o-notch" /></span>
                        : <span><i className="fa fa-code-fork" /></span>}
                </div>
            );
        }
        return '';
    }

    renderSaveButton() {
        const { user, isSaving } = this.state;
        if (user.uid && this.isOwner()) {
            return (
                <div title="Save" className="btn btn-save" onClick={this.save} onKeyDown={app.handleEnter(this.save)} role="button" tabIndex={0}>
                    {isSaving
                        ? <span><i className="fa fa-spin fa-circle-o-notch" /></span>
                        : <span><i className="fa fa-save" /></span>}
                </div>
            );
        }
        return '';
    }

    renderShareButton() {
        const { isNew } = this.state;
        if (!isNew) {
            return (
                <Popup
                    trigger={(open) => {
                        if (open) { setTimeout(() => this.copyLink(), 100); }
                        return (
                            <div title="Share" className="btn">
                                <span><i style={{ fontWeight: 200 }} className="fa fa-share-alt" /></span>
                            </div>
                        );
                    }}
                    contentStyle={{ width: '267px' }}
                    position="bottom center"
                    closeOnDocumentClick
                >
                    <div>
                        <input readOnly id="shareLinkText" style={{ width: '200px' }} type="text" value={window.location} onFocus={(e) => e.target.select()} />
                    &nbsp;&nbsp;
                        <span onClick={this.copyLink} onKeyDown={app.handleEnter(this.copyLink)} role="button" tabIndex={0} style={{ cursor: 'pointer' }}>
                            <i className="fa fa-clipboard" />
&nbsp;Copy
                        </span>
                    </div>
                </Popup>
            );
        }
        return '';
    }

    renderUserDisplay() {
        const { user } = this.state;
        return (
            <div className="btn user-info">
                <img src={user.photo} alt="profile" />
                <span className="user-name">{user.name}</span>
            </div>
        );
    }

    renderMyJams() {
        const { user, isMyJamsLoading, myJams } = this.state;
        return (
            <Popup
                trigger={(isOpen) => {
                    if (isOpen) { setImmediate(() => this.loadMyJams()); }
                    return (
                        <div className="Dropdown-option">
                            <i className="fa fa-book" />
&nbsp;&nbsp;My Jams&nbsp;(
                            {user.jamsCount || 0}
                            )
                        </div>
                    );
                }}
                modal
                contentStyle={{ padding: '10px 20px 10px 20px' }}
                closeOnDocumentClick
            >
                <div style={{ width: '100%' }}>
                    {isMyJamsLoading
                        ? <div className="popup-myjams-loading"><i className="fa fa-spin fa-circle-o-notch" /></div>
                        : (
                            <div className="popup-myjams">
                                {myJams.map((jam) => (
                                    <a className="myjam" href={`${window.location.origin}/?p=${jam.id}`} key={jam.id}>
                                        <h3>{jam.name}</h3>
                                        <div>
                                            Last Updated
                                            {new Date(jam.dateUpdated).toLocaleString()}
                                        </div>
                                        <div>
                                            Runtime:
                                            {jam.runtime}
                                        </div>
                                        <div>
                                            Scenarios:
                                            {jam.features.scenarioCount}
                                            {' '}
                                            (
                                            {jam.features.lineCount}
                                            {' '}
                                            lines)
                                        </div>
                                        <div>
                                            Step Definitions: JavaScript (
                                            {jam.stepDefinitions.lineCount}
                                            {' '}
                                            lines)
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                </div>
            </Popup>
        );
    }

    renderSignInArea() {
        const { user } = this.state;
        if (user.uid) {
            return (
                <Popup
                    trigger={this.renderUserDisplay()}
                    position="bottom right"
                    closeOnDocumentClick
                    closeOnEscape
                    mouseLeaveDelay={300}
                    contentStyle={{ padding: '0px', border: 'none' }}
                    arrow={false}
                >
                    <div className="Dropdown-menu" aria-expanded="true">
                        {this.renderMyJams()}
                        <div className="Dropdown-option" onClick={this.signOut} onKeyDown={app.handleEnter(this.signOut)} role="button" tabIndex={0}>
                            <i className="fa fa-sign-out" />
&nbsp;&nbsp;Sign Out
                        </div>
                    </div>
                </Popup>
            );
        }
        return <div onClick={this.signIn} onKeyDown={app.handleEnter(this.signIn)} className="btn user-signin" role="button" tabIndex={0}>Log In/Sign Up</div>;
    }

    renderMenu() {
        return (
            <div className="menu">
                {this.renderTestButton()}
                {this.renderSignInArea()}
            </div>
        );
    }

    renderAboutSite() {
        return (
            <Popup
                trigger={<div className="Dropdown-option">About testjam.io</div>}
                modal
                contentStyle={{ padding: '10px 20px 10px 20px' }}
                closeOnDocumentClick
            >
                <div style={{ width: '100%' }}>
                    <h2 style={{ marginBottom: '0' }}>
                        testjam.io version
                        {build.version}
                    </h2>
                    <p>
                        Last Updated on
                        {new Date(build.date).toDateString()}
                    </p>
                    <br />
                    <h3>What is TestJam?</h3>
                    <p>
                        Welcome to testjam.io, an online coding environment specifically designed for Cucumber and Gherkin. When I first started building this project, I realized that most major programming languages and frameworks have some sort of online sandbox environment for sharing code examples, but Cucumber did not. As BDD gets more popular in the modern QA toolkit, the need to quickly share and experiment with testing tools over the Internet will increase.
                    </p>
                    <h3>Project Objectives</h3>
                    <ul>
                        <li>Deliver an easy-to-use web-based tool for creating and sharing feature files and their accompanying step definitions.</li>
                        <li>Improve the quality of online documentation and Q&amp;A responses regarding Cucumber and Gherkin.</li>
                        <li>Provide a useful service to the wider QA automation community.</li>
                        <li>
                            <i>Personal Goal:</i>
&nbsp;Avoid boredom during the COVID-19 quarantine by developing and launching a new web-based software tool.
                        </li>
                    </ul>
                    <h3>About Me</h3>
                    <p>
                        My name is Steven, and I&apos;m an automation engineer and software developer. I have been using Cucumber (
                        <a href="https://specflow.org/" target="_blank" rel="noreferrer">SpecFlow</a>
                        {' '}
                        and
                        {' '}
                        <a href="https://github.com/cucumber/cucumber-js" target="_blank" rel="noreferrer">CucumberJS</a>
                        ) at various organizations since 2014, both as a developer and an automation engineer. I hope to continue to learn more about automated testing in the future and also help mentor others on software and maintaining quality during a project.
                        <br />
                        <br />
                    </p>
                    <a className="link-item" href="https://www.github.com/stevenmhunt" target="_blank" rel="noreferrer">
                        <i className="fa fa-github" />
&nbsp;@stevenmhunt
                    </a>
                    <a className="link-item" href="https://www.twitter.com/stevenmhunt" target="_blank" rel="noreferrer">
                        <i className="fa fa-twitter" />
&nbsp;@stevenmhunt
                    </a>
                    <a className="link-item" href="http://www.linkedin.com/in/stevenmhunt" target="_blank" rel="noreferrer">
                        <i className="fa fa-linkedin" />
&nbsp;stevenmhunt
                    </a>
                    <br />
                    <br />
                </div>
            </Popup>
        );
    }

    renderSiteInfo() {
        return (
            <div className="btn site-info">
                <img src="/images/cucumber.png" alt="cucumber logo" />
                <span className="site-name">testjam.io</span>
            </div>
        );
    }

    render() {
        const {
            theme, fork, name, isEditName, isNew, owner,
        } = this.state;
        return (
            <div className="header-view">
                <div className="header-left">
                    <Popup
                        trigger={this.renderSiteInfo()}
                        position="bottom left"
                        closeOnDocumentClick
                        closeOnEscape
                        mouseLeaveDelay={300}
                        contentStyle={{ padding: '0px', border: 'none' }}
                        arrow={false}
                    >
                        <div className="Dropdown-menu" aria-expanded="true">
                            <div className="Dropdown-option Dropdown-option-disabled">
                                Theme:
                                {' '}
                                <Dropdown options={this.themes} value={theme} onChange={this.setTheme} />
                            </div>
                            <a className="Dropdown-option" href={`${window.location.origin}/?p=0Djdc5ps8TE1ssv558rU`}>Getting Started</a>
                            {this.renderAboutSite()}
                            <a className="Dropdown-option" href="https://cucumber.io/docs/gherkin/" target="_blank" rel="noreferrer">
                                <i className="fa fa-external-link" />
&nbsp;&nbsp;Learn more about Gherkin
                            </a>
                        </div>
                    </Popup>
                    <a href={window.location.origin} target="_blank" className="btn" title="New Jam..." rel="noreferrer">
                        <span><i className="fa fa-plus" /></span>
                    </a>
                    {this.renderForkButton()}
                    {this.renderSaveButton()}
                    {this.renderShareButton()}
                    {this.renderLikeButton()}
                </div>
                <div className="header-center">
                    {fork
                        ? (
                            <Popup
                                position="bottom center"
                                on="hover"
                                closeOnDocumentClick
                                closeOnEscape
                                trigger={(
                                    <div className="item item-fork">
                                        <span><i className="fa fa-code-fork" /></span>
                                    </div>
                                )}
                            >
                                <div className="fork-tooltip">
                                    <div>
                                        Forked from
                                        <b>{fork.name}</b>
&nbsp;&nbsp;
                                        <a href={`${window.location.origin}/?p=${fork.id}`} target="_blank" rel="noreferrer">
                                            <i className="fa fa-external-link" />
                                        </a>
                                    </div>
                                    <div className="view-header">
                                        <div className="view-header-left">
                                            <div className="item">
                                                <img src={fork.createdBy.photo} alt="created by" />
                                            </div>
                                            <div className="item">
                                                {fork.createdBy.name}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        ) : ''}
                    {name && this.isOwner() && isEditName
                        ? (
                            <div className="item jam-name jam-name-editable">
                                <input type="text" defaultValue={name} onBlur={this.setName} />
                            </div>
                        ) : ''}
                    {name && this.isOwner() && !isEditName
                        ? (
                            <div title="Edit title..." className="item jam-name jam-name-editable" onClick={this.editName} onKeyDown={app.handleEnter(this.editName)} role="button" tabIndex={0}>
                                <span style={isNew ? { fontStyle: 'italic' } : {}}>{name}</span>
                                <span style={{ fontSize: '14px', marginLeft: '10px' }}><i className="fa fa-pencil" /></span>
                            </div>
                        ) : ''}
                    {name && !this.isOwner()
                        ? (
                            <div className="item jam-name">
                                <span>{name}</span>
                            </div>
                        ) : ''}
                    {owner && !this.isOwner()
                        ? (
                            <div className="item jam-info">
                                <img src={owner.photo} alt="creator" />
                                <span className="user-name">{owner.name}</span>
                            </div>
                        ) : ''}
                </div>
                <div className="header-right">
                    {this.renderMenu()}
                </div>
            </div>
        );
    }
}
