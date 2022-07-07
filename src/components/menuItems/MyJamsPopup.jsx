import React from 'react';
import Popup from 'reactjs-popup';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import app from '../../app';

const setImmediate = (fn) => setTimeout(fn, 0);

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

function getRuntimeName({ language, runtime }) {
    return (app.getRuntimes(language).filter((i) => i.value === runtime)[0] || {}).label;
}

function getLanguageName({ language }) {
    return (app.getLanguages().filter((i) => i.value === language)[0] || {}).label;
}

export default function renderMyJamsPopup({
    user, isMyJamsLoading, myJams, after,
}) {
    function onNextPage() {
        const { id } = myJams[myJams.length - 1];
        app.setJamsAfter(id);
    }

    return (
        <Popup
            trigger={(isOpen) => {
                if (isOpen) { setImmediate(() => app.getMyJams(after)); }
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
                        <div>
                            <div className="popup-myjams">
                                {myJams.map((jam) => (
                                    <a className="myjam" href={`${window.location.origin}/?p=${jam.id}`} key={jam.id}>
                                        <h3>{jam.name}</h3>
                                        <div style={{ float: 'left' }}>
                                            Updated
                                            {' '}
                                            {timeAgo.format(jam.dateUpdated)}
                                        </div>
                                        <div style={{ float: 'right' }}>
                                            {getRuntimeName(jam)}
                                            {' '}
                                            (
                                            {getLanguageName(jam)}
                                            )
                                        </div>
                                    </a>
                                ))}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button onClick={onNextPage} type="button">
                                    Next
                                    &nbsp;
                                    <i className="fa fa-chevron-right" />
                                </button>
                            </div>
                        </div>
                    )}
            </div>
        </Popup>
    );
}
