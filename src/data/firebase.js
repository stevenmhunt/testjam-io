const EventEmitter = require('events');
const config = require('../../config');

firebase.initializeApp(config.firebase);

let onAuthChangedFn = () => 0;
function onAuthChanged(cb) {
    onAuthChangedFn = cb;
}

firebase.auth().onAuthStateChanged((user) => onAuthChangedFn({ action: user ? 'signIn' : 'signOut', user }));

function signIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => firebase.auth().signInWithPopup(provider))
        .then((result) => {
            const token = result.credential.accessToken;
            const user = result.user;
            return { token, user };
        });
}

module.exports = {
    signIn,
    onAuthChanged
};