/* eslint-disable no-undef */

const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics ? firebase.analytics() : null;
const functions = firebase.functions();

if (analytics) {
    analytics.setAnalyticsCollectionEnabled(true);
}

const fnGetMyJams = functions.httpsCallable('getMyJams');

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
    const provider = new firebase.auth.GoogleAuthProvider();
    return auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => auth.signInWithPopup(provider))
        .then((result) => result.user);
}

function signOut() {
    auth.signOut();
    authUser = null;
}

// Database

function getJam(id) {
    if (!id) {
        return Promise.reject(new Error('An id is required.'));
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

function saveJam(id, {
    name, features, stepDefinitions, runtime, dialect, language, fork,
}) {
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
            dateUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            features,
            stepDefinitions,
            runtime,
            dialect,
            language,
            uid: authUser.uid,
            createdBy: { uid: authUser.uid, name: authUser.displayName, photo: authUser.photoURL },
            fork: fork || null,
        };

        return db.collection('jams').add(jam).then((r) => {
            analytics.logEvent('share', { content_type: 'jam', item_id: r.id });
            return db.collection('users').doc(authUser.uid).update({
                jamsCount: firebase.firestore.FieldValue.increment(1),
            }).then(() => r.id);
        });
    }
    return db.collection('jams').doc(id).update({
        name,
        features,
        stepDefinitions,
        runtime,
        dialect,
        language,
        dateUpdated: firebase.firestore.FieldValue.serverTimestamp(),
    }).then(() => null);
}

function forkJam(id, {
    name, features, stepDefinitions, dialect, language, runtime, createdBy,
}) {
    if (!authUser || !authUser.uid) {
        return Promise.reject(new Error('You must be an authenticated user to fork a jam.'));
    }
    return saveJam(null, {
        name: `${name} (copy)`,
        features,
        stepDefinitions,
        dialect,
        language,
        runtime,
        fork: {
            id,
            name,
            createdBy,
        },
    });
}

function likeJam(id) {
    if (!id) {
        return Promise.reject(new Error('An id is required.'));
    }
    if (!authUser || !authUser.uid) {
        return Promise.reject(new Error('You must be an authenticated user to like a jam.'));
    }

    const batch = db.batch();

    batch.update(db.collection('jams').doc(id), {
        likedBy: firebase.firestore.FieldValue.arrayUnion(authUser.uid),
    });

    batch.update(db.collection('users').doc(authUser.uid), {
        likes: firebase.firestore.FieldValue.arrayUnion(id),
    });

    return batch.commit();
}

function unlikeJam(id) {
    if (!id) {
        return Promise.reject(new Error('An id is required.'));
    }
    if (!authUser || !authUser.uid) {
        return Promise.reject(new Error('You must be an authenticated user to unlike a jam.'));
    }

    const batch = db.batch();

    batch.update(db.collection('jams').doc(id), {
        likedBy: firebase.firestore.FieldValue.arrayRemove(authUser.uid),
    });

    batch.update(db.collection('users').doc(authUser.uid), {
        likes: firebase.firestore.FieldValue.arrayRemove(id),
    });

    return batch.commit();
}

function getMyJams(startAfter = null, limit = 10) {
    if (!authUser || !authUser.uid) {
        return Promise.reject(new Error('You must be an authenticated user to get your jams.'));
    }
    return fnGetMyJams({ limit, startAfter })
        .then((r) => r.data);
}

function loadUser(id) {
    const userId = id || authUser.uid;

    function attemptCreateProfile() {
        const defaultProfile = {
            name: authUser.displayName, photo: authUser.photoURL, likes: [], jamsCount: 0,
        };
        if (userId === authUser.uid) {
            return db.collection('users').doc(userId).set(defaultProfile).then(() => defaultProfile);
        }
        return null;
    }
    return db.collection('users').doc(userId).get()
        .then((r) => (r.exists ? r.data() : attemptCreateProfile()));
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
    db: () => db,
};
