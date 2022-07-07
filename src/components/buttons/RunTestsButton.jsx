import React from 'react';
import app from '../../app';

function runTests() {
    app.run();
}

export default function renderRunTestsButton({ isTestRunning, isTestEnabled }) {
    let innerButton = (
        <span>
            <i className="fa fa-play" />
&nbsp;&nbsp;Run Tests
        </span>
    );
    let buttonClass = 'btn btn-run';
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
    return <div className={buttonClass} role="button" tabIndex={0} onClick={runTests} onKeyDown={app.handleEnter(runTests)}>{innerButton}</div>;
}
