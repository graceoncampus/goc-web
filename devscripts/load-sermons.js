require('dotenv').config();
const admin = require('firebase-admin');
const Parser = require('rss-parser');
const config = require('../server/config/firebase.json');

const parser = new Parser();
admin.initializeApp({
  credential: admin.credential.cert(config),
  databaseURL: process.env.DATABASE_URL,
});

const batchSize = 1000;

function deleteQueryBatch(db, query, resolve, reject) {
  query.get()
    .then((snapshot) => {
      // When there are no documents left, we are done
      if (snapshot.size === 0) {
        return 0;
      }

      // Delete documents in a batch
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      return batch.commit().then(() => snapshot.size);
    }).then((numDeleted) => {
      if (numDeleted === 0) {
        resolve();
        return;
      }

      // Recurse on the next process tick, to avoid
      // exploding the stack.
      process.nextTick(() => {
        deleteQueryBatch(db, query, resolve, reject);
      });
    })
    .catch(reject);
}


function deleteCollection(db, collectionPath) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve, reject);
  });
}

const exportSermons = async (sermons) => {
  try {
    await deleteCollection(admin.firestore(), 'sermons');
  } catch (e) {
    console.log(e);
  }

  const batch = admin.firestore().batch();
  sermons.forEach((s) => {
    const newSermonRef = admin.firestore().collection('sermons').doc();
    const {
      title,
      date,
      speaker,
      passage,
      URI,
    } = s;
    batch.set(newSermonRef, {
      title,
      date,
      speaker,
      passage,
      URI,
    });
  });
  try {
    await batch.commit();
  } catch (e) {
    console.log(e);
  }
};

const loadSermons = async () => {
  try {
    const feed = await parser.parseURL('http://feeds.feedburner.com/gracechurch-ucla?fmt=xml');
    const sermons = feed.items.map(item => ({
      title: item.title,
      speaker: item.creator,
      date: new Date(item.isoDate),
      passage: item.content.split(' • ')[1],
      URI: item.enclosure.url,
    }));
    exportSermons(sermons);
  } catch (error) {
    console.log(error);
  }
};


loadSermons();

module.exports.loadSermons = loadSermons;
