import _ from 'lodash';
import config from '../../config';

firebase.initializeApp(config.firebase);

const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics();

analytics.setAnalyticsCollectionEnabled(true);

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
                analytics.logEvent('page_view');
                return result.data();
            }
            throw new Error('The requested resource does not exist.');
        });
}

function saveJam(id, { name, features, stepDefinitions, runtime, fork }) {
    if (!features || !stepDefinitions || !runtime) {
        return Promise.reject(new Error('Required data fields are missing.'));
    }
    if (!authUser || !authUser.uid) {
        return Promise.reject(new Error('You must be an authenticated user to save a jam.'));
    }
    if (!id) {
        const jam = {
            name,
            dateCreated: firebase.firestore.FieldValue.serverTimestamp(),
            features,
            stepDefinitions,
            runtime,
            uid: authUser.uid,
            createdBy: { uid: authUser.uid, name: authUser.displayName, photo: authUser.photoURL },
            fork: fork || null
        };
        return db.collection('jams').add(jam).then(r => r.id);
    }
    return db.collection('jams').doc(id).update({
        name,
        features,
        stepDefinitions,
        runtime
    }).then(() => null);
}

function forkJam(id, { name, features, stepDefinitions, runtime, createdBy }) {
    return saveJam(null, {
        name: `${name} (copy)`, features, stepDefinitions, runtime, fork: {
            id,
            name,
            createdBy
        }
    })
}

function getMyJams() {
    if (!authUser || !authUser.uid) {
        return Promise.resolve([]);
    }
    return db.collection('jams')
        .where('uid', '==', authUser.uid)
        .get()
        .then(r => r.docs.map(i => ({
            id: i.id,
            name: i.data().name
        })));
}

module.exports = {
    signIn,
    signOut,
    onAuthChanged,
    getJam,
    saveJam,
    forkJam,
    getMyJams
};