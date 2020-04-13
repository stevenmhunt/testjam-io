import _ from 'lodash';
import config from '../../config';

firebase.initializeApp(config.firebase);

const auth = firebase.auth();
const db = firebase.firestore();

// User Authentication

let onAuthChangedFn = () => 0;
function onAuthChanged(cb) {
    onAuthChangedFn = cb;
}

let authUser = null;

auth.onAuthStateChanged((user) => {
    authUser = user;
    return onAuthChangedFn({ action: user ? 'signIn' : 'signOut', user });
});

function signIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => auth.signInWithPopup(provider))
        .then(result => result.user);
}

function signOut() {
    auth.signOut();
    authUser = null;
}

// Database

function getJam(id) {
    if (!id) {
        return Promise.reject('An id is required.');
    }
    return db.collection('jams').doc(id).get()
        .then((result) => {
            if (result.exists) {
                return result.data();
            }
            throw new Error(`Data record ${id} does not exist.`);
        });
}

function saveJam(id, { features, stepDefinitions, runtime }) {
    if (!features || !stepDefinitions || !runtime) {
        return Promise.reject('Required data fields are missing.');
    }
    if (!id) {
        return db.collection('jams').add({
            name: 'New Jam',
            dateCreated: firebase.firestore.FieldValue.serverTimestamp(),
            features,
            stepDefinitions,
            runtime,
            uid: authUser.uid,
            createdBy: { name: authUser.displayName, photo: authUser.photoURL }
        }).then(r => r.id);
    }
    return db.collection('jams').doc(id).update({
        features,
        stepDefinitions,
        runtime
    }).then(() => null);
}

module.exports = {
    signIn,
    signOut,
    onAuthChanged,
    getJam,
    saveJam
};