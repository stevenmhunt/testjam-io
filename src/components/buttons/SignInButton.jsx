import React from 'react';
import Popup from 'reactjs-popup';
import MyJamsPopup from '../menuItems/MyJamsPopup';
import app from '../../app';

function renderUserDisplay(user) {
    return (
        <div className="btn user-info">
            <img src={user.photo} alt="profile" />
            <span className="user-name">{user.name}</span>
        </div>
    );
}

export default function renderSignInButton({
    user, isMyJamsLoading, myJams, after,
}) {
    if (user.uid) {
        return (
            <Popup
                trigger={renderUserDisplay(user)}
                position="bottom right"
                closeOnDocumentClick
                closeOnEscape
                mouseLeaveDelay={300}
                contentStyle={{ padding: '0px', border: 'none' }}
                arrow={false}
            >
                <div className="Dropdown-menu" aria-expanded="true">
                    <MyJamsPopup
                        user={user}
                        isMyJamsLoading={isMyJamsLoading}
                        myJams={myJams}
                        after={after}
                    />
                    <div className="Dropdown-option" onClick={app.signOut} onKeyDown={app.handleEnter(app.signOut)} role="button" tabIndex={0}>
                        <i className="fa fa-sign-out" />
&nbsp;&nbsp;Sign Out
                    </div>
                </div>
            </Popup>
        );
    }
    return <div onClick={app.signIn} onKeyDown={app.handleEnter(app.signIn)} className="btn user-signin" role="button" tabIndex={0}>Log In/Sign Up</div>;
}
