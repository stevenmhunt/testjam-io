const functions = require('firebase-functions');
const firebase = require('firebase-admin');

firebase.initializeApp();

const firestore = firebase.firestore();

const processJam = jam => ({
    id: jam.id,
    name: jam.name,
    dateUpdated: jam.dateUpdated || jam.dateCreated,
    runtime: jam.runtime,
    language: jam.language || 'javascript',
    dialect: jam.dialect || 'en',
    features: {
        lineCount: jam.features.map(i => i.source.split('\n').length).reduce((a, b) => a + b),
        scenarioCount: jam.features.map(i => i.source.split('\n').filter(l => l.trim().indexOf('Scenario') === 0).length).reduce((a, b) => a + b)
    },
    stepDefinitions: {
        lineCount: jam.stepDefinitions.map(i => i.source.split('\n').length).reduce((a, b) => a + b)
    }
});

exports.getMyJams = functions.https.onCall((data, context) => {
    const uid = (context.auth || {}).uid;
    if (!uid) {
        throw new functions.https.HttpsError('failed-precondition', 'The user must be authenticated to make this call.');
    }
    const limit = parseInt(data.limit, 10) || 10;
    const after = data.after;
    console.log(`After: ${after}`);

    let query = firestore.collection('jams')
        .where('uid', '==', uid)
        .orderBy(firebase.firestore.FieldPath.documentId())
        .limit(limit);

    if (after) {
        query = query.startAfter(after);
    }

    return query.get().then(r => r.docs.map(i => processJam(Object.assign({ id: i.id }, i.data()))));
});