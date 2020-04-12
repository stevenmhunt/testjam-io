import React from 'react';
import Dropdown from 'react-dropdown';
import eventHub from '../eventHub';

export default
    class HeaderView extends React.Component {

    constructor(props) {
        super(props);
        
        this.changeTheme = this.setTheme.bind(this);
        this.runTest = this.runTest.bind(this);
        this.onToggleLike = this.toggleLike.bind(this);

        this.state = {
            theme: eventHub.getTheme(),
            isTestRunning: false,
            isLiked: false
        }

        this.themes = eventHub.getThemes();

        eventHub.on('testRunStarted', () => this.setState({ isTestRunning: true }));
        eventHub.on('testRunEnded', () => this.setState({ isTestRunning: false }));
        eventHub.on('themeChanged', theme => this.setState(() => ({ theme })));
        eventHub.on('liked', () => this.setState({ isLiked: true }));
        eventHub.on('unliked', () => this.setState({ isLiked: false }));
    }

    setTheme(t) {
        eventHub.setTheme(t.value);
    }

    runTest() {
        if (!this.state.isTestRunning) {
            eventHub.test();
        }
    }

    toggleLike() {
        if (this.state.isLiked) {
            eventHub.unlike();
        }
        else {
            eventHub.like();
        }
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
                <div className="menu">
                    <div className="item" title="Theme" style={{ marginRight: '6px' }}>
                        <Dropdown options={this.themes} value={this.state.theme} onChange={this.setTheme} />
                    </div>
                    <div className={this.state.isTestRunning ? "btn btn-running" : "btn btn-run"} onClick={this.runTest}>
                        {this.state.isTestRunning ? 
                        <span>&nbsp;<i className="fa fa-spinner fa-spin"></i>&nbsp;Running...</span> :
                        <span>&nbsp;<i className="fa fa-play-circle"></i>&nbsp;&nbsp;Run Tests</span>}
                    </div>
                    <div className={this.state.isLiked ? "btn btn-liked" : "btn btn-unliked"} onClick={this.toggleLike}>
                        {this.state.isLiked ? 
                        <span>&nbsp;<i className="fa fa-heart"></i></span> :
                        <span>&nbsp;<i className="fa fa-heart-o"></i></span>}                        
                    </div>
                </div>
            </div>
        </div>);
    }
}