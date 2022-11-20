/* eslint-disable max-len */
import React from 'react';
import Popup from 'reactjs-popup';

const { build } = require('../../../package.json');

export default function renderAboutSitePopup() {
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
                    &nbsp;
                    {build.version}
                </h2>
                <p>
                    Last Updated on
                    &nbsp;
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
                    My name is Steven, and I&apos;m a software developer and automation/DevOps engineer. I have been using Cucumber (
                    <a href="https://specflow.org/" target="_blank" rel="noreferrer">SpecFlow</a>
                    {' '}
                    and
                    {' '}
                    <a href="https://github.com/cucumber/cucumber-js" target="_blank" rel="noreferrer">CucumberJS</a>
                    ) at various organizations since 2014, both as a developer and an automation engineer. I hope to continue to learn more about automated testing in the future and also help mentor others on software and maintaining quality during a project. For more information, check out my website:
                    {' '}
                    <a href="https://stevenhunt.me" target="_blank" rel="noreferrer">stevenhunt.me</a>
                    <br />
                    <br />
                </p>
                <a className="link-item" href="https://www.github.com/stevenmhunt" target="_blank" rel="noreferrer">
                    <i className="fa fa-github" />
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
