/* eslint-disable max-len */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-nested-ternary */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/sort-comp */
import React from 'react';
import { NotificationManager } from 'react-notifications';
import Dropdown from 'react-dropdown';
import Popup from 'reactjs-popup';

import AboutSite from '../components/menuItems/AboutSitePopup';
import RunTestsButton from '../components/buttons/RunTestsButton';
import SignInButton from '../components/buttons/SignInButton';

import app from '../app';

export default class HeaderView extends React.Component {
    constructor(props) {
        super(props);

        this.editName = this.editName.bind(this);
        this.setName = this.setName.bind(this);
        this.setTheme = this.setTheme.bind(this);
        this.toggleLike = this.toggleLike.bind(this);
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
        app.on('jamsAfterChanged', (after) => this.setState({ after }));
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

    renderMenu() {
        const {
            isTestRunning, isTestEnabled, user, isMyJamsLoading, myJams, after,
        } = this.state;
        return (
            <div className="menu">
                <RunTestsButton isTestRunning={isTestRunning} isTestEnabled={isTestEnabled} />
                <SignInButton user={user} isMyJamsLoading={isMyJamsLoading} myJams={myJams} after={after} />
            </div>
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
                            <AboutSite />
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
                                        {' '}
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
