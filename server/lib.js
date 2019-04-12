import admin from 'firebase-admin';
import mail from 'mailgun-js';
import config from './config/firebase.json';

admin.initializeApp({
  credential: admin.credential.cert(config),
  databaseURL: process.env.DATABASE_URL,
});
admin.firestore().settings({ timestampsInSnapshots: true });
const users = admin.firestore().collection('users');

export const lookupByUID = uid => users.doc(uid).get().then((doc) => {
  if (doc.exists) {
    const user = doc.data();
    return `${user.firstName} ${user.lastName}`;
  } return null;
}).catch(err => console.log(err.message));


export const isLoggedIn = (req, res, next) => (req.isAuthenticated() ? next() : res.redirect(`/login/redir${req.url}`));

export const isNotLoggedIn = (req, res, next) => (!req.isAuthenticated() ? next() : res.redirect(`/login/redir${req.url}`));

export const replaceURLsWithLinks = (text) => {
  const re = /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
  return text.replace(re, (match, lParens, url) => {
    const rParens = '';
    lParens = lParens || '';
    const lParenCounter = /\(/g;
    while (lParenCounter.exec(lParens)) {
      let m;
      if (m = /(.*)(\.\).*)/.exec(url)
                    || /(.*)(\).*)/.exec(url)) {
        url = m[1];
        rParens = m[2] + rParens;
      }
    }
    return `${lParens}<a href='${url}'>${url}</a>${rParens}`;
  });
};
export const mailgun = mail({
  apiKey: process.env.API_KEY,
  domain: process.env.API_DOMAIN,
});

