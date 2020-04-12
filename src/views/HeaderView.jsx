import React from 'react';
import Dropdown from 'react-dropdown';
import eventHub from '../eventHub';

export default
    class HeaderView extends React.Component {

    constructor(props) {
        super(props);
        
        this.changeTheme = this.changeTheme.bind(this);
        this.onTest = this.onTest.bind(this);
        this.onToggleLike = this.onToggleLike.bind(this);

        this.state = {
            theme: eventHub.getTheme(),
            isTestRunning: false,
            isLiked: false
        }

        this.themes = [
            { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }
        ];

        eventHub.on('testRunStarted', () => this.setState({ isTestRunning: true }));
        eventHub.on('testRunEnded', () => this.setState({ isTestRunning: false }));
        eventHub.on('themeChanged', theme => this.setState(() => ({ theme })));
        eventHub.on('liked', () => this.setState({ isLiked: true }));
        eventHub.on('unliked', () => this.setState({ isLiked: false }));
    }

    changeTheme(t) {
        eventHub.setTheme(t.value);
    }

    onTest() {
        if (!this.state.isTestRunning) {
            eventHub.test();
        }
    }

    onToggleLike() {
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
                        <Dropdown options={this.themes} value={this.state.theme} onChange={this.changeTheme} />
                    </div>
                    <div className={this.state.isTestRunning ? "btn btn-running" : "btn btn-run"} onClick={this.onTest}>
                        {this.state.isTestRunning ? 
                        <span>&nbsp;<i className="fa fa-spinner fa-spin"></i>&nbsp;Running...</span> :
                        <span>&nbsp;<i className="fa fa-play-circle"></i>&nbsp;&nbsp;Run Tests</span>}
                    </div>
                    <div className={this.state.isLiked ? "btn btn-liked" : "btn btn-unliked"} onClick={this.onToggleLike}>
                        {this.state.isLiked ? 
                        <span>&nbsp;<i className="fa fa-heart"></i></span> :
                        <span>&nbsp;<i className="fa fa-heart-o"></i></span>}                        
                    </div>
                </div>
            </div>
        </div>);
    }
}