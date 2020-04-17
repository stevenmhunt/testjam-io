const _ = require('lodash');
const config = require('../../config');

firebase.initializeApp(config.firebase);

const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics ? firebase.analytics() : null;

if (analytics) {
    analytics.setAnalyticsCollectionEnabled(true);
}

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
    return auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
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
        return db.collection('jams').add(jam).then((r) => {
            analytics.logEvent('share', { content_type: 'jam', item_id: r.id });
            return r.id
        });
    }
    return db.collection('jams').doc(id).update({
        name,
        features,
        stepDefinitions,
        runtime
    }).then(() => null);
}

function forkJam(id, { name, features, stepDefinitions, runtime, createdBy }) {
    if (!authUser || !authUser.uid) {
        return Promise.reject(new Error('You must be an authenticated user to fork a jam.'));
    }
    return saveJam(null, {
        name: `${name} (copy)`, features, stepDefinitions, runtime, fork: {
            id,
            name,
            createdBy
        }
    })
}

function likeJam(id) {
    if (!id) {
        return Promise.reject('An id is required.');
    }
    if (!authUser || !authUser.uid) {
        return Promise.reject(new Error('You must be an authenticated user to like a jam.'));
    }

    const batch = db.batch();

    batch.update(db.collection('jams').doc(id), {
        likedBy: firebase.firestore.FieldValue.arrayUnion(authUser.uid)
    });
    
    batch.update(db.collection('users').doc(authUser.uid), {
        likes: firebase.firestore.FieldValue.arrayUnion(id)
    });
    
    return batch.commit();
}

function unlikeJam(id) {
    if (!id) {
        return Promise.reject('An id is required.');
    }
    if (!authUser || !authUser.uid) {
        return Promise.reject(new Error('You must be an authenticated user to unlike a jam.'));
    }

    const batch = db.batch();

    batch.update(db.collection('jams').doc(id), {
        likedBy: firebase.firestore.FieldValue.arrayRemove(authUser.uid)
    });
    
    batch.update(db.collection('users').doc(authUser.uid), {
        likes: firebase.firestore.FieldValue.arrayRemove(id)
    });
    
    return batch.commit();
}

function getMyJams() {
    if (!authUser || !authUser.uid) {
        return Promise.reject(new Error('You must be an authenticated user to get your jams.'));
    }
    return db.collection('jams')
        .where('uid', '==', authUser.uid)
        .get()
        .then(r => r.docs.map(i => ({
            id: i.id,
            name: i.data().name
        })));
}

function loadUser() {
    if (!authUser || !authUser.uid) {
        return Promise.reject(new Error('You must be an authenticated user to load a user.'));
    }

    const defaultUser = { likes: [] };
    return db.collection('users').doc(authUser.uid).get()
        .then(r => r.exists ? r.data() : 
            db.collection('users').doc(authUser.uid).set(defaultUser).then(() => defaultUser)
        );
}

function loadProfile(id) {
    function attemptCreateProfile() {
        const defaultProfile = { name: authUser.displayName, photo: authUser.photoURL };
        if (id === authUser.uid) {
            return db.collection('profiles').doc(id).set(defaultProfile).then(() => defaultProfile);
        }
        return null;
    }
    return db.collection('profiles').doc(id).get()
        .then(r => r.exists ? r.data() : attemptCreateProfile());
}

function initUserProfile(user) {
    return Promise.all([
        db.collection('profiles').doc(user.uid).set({
            name: user.displayName, photo: user.photoURL
        }, { merge: true }),
        db.collection('users').doc(user.uid).set({

        }, { merge: true })
    ]).then(() => user);
}

module.exports = {
    signIn,
    signOut,
    onAuthChanged,
    getJam,
    saveJam,
    forkJam,
    likeJam,
    unlikeJam,
    getMyJams,
    loadUser,
    loadProfile,
    db: () => db
};