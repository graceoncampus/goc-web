import moment from 'moment';
import admin from 'firebase-admin';

const resourcesRef = admin.firestore().collection('resources');
const DOC_NAME = 'markdown';

export const getResources = async (req, res) => {
  let resources = '';
  try {
    const mdSnapshot = await resourcesRef.doc(DOC_NAME).get();
    resources = mdSnapshot.data().text;
  } catch (e) {
    console.error(e);
  }

  res.render('resources.ejs', {
    title: 'Resources',
    resources
  });
};

export const getEditResources = async (req, res) => {
  let resources = '';
  try {
    const mdSnapshot = await resourcesRef.doc(DOC_NAME).get();
    resources = mdSnapshot.data().text;
  } catch (e) {
    console.error(e);
  }

  res.render('resourcesEdit.ejs', {
    title: 'Edit Resources',
    resources
  });
};

export const postEditResources = async (req, res) => {
  await resourcesRef.doc(DOC_NAME).set({ text: req.body.markdown });
  res.redirect('/resources');
};
