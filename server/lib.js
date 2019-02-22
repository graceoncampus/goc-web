var _ = require('lodash');
//var admin = require('firebase-admin');
//var firebaseDB = admin.database();
import { firestoreDB } from "./firebase"
var users = firestoreDB.collection('users');

export const lookupByUID = (uid) => users.doc(uid).get().then(doc => {
  if (doc.exists) {
    let user = doc.data();
    return `${user.firstName} ${user.lastName}`;
  } else return null;
})//).catch(() => return null)


export const isLoggedIn = (req, res, next) => (req.isAuthenticated() ? next() : res.redirect('/login/redir' + req.url));

export const isNotLoggedIn = (req, res, next) => (!req.isAuthenticated() ? next() : res.redirect('/login/redir' + req.url));

export const replaceURLsWithLinks = (text) => {
  const re = /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
  return text.replace(re, (match, lParens, url) => {
        const rParens = '';
        lParens = lParens || '';
        const lParenCounter = /\(/g;
        while (lParenCounter.exec(lParens)) {
            let m;
            if (m = /(.*)(\.\).*)/.exec(url) ||
                    /(.*)(\).*)/.exec(url)) {
                url = m[1];
                rParens = m[2] + rParens;
            }
        }
        return lParens + "<a href='" + url + "'>" + url + "</a>" + rParens;
    });
}
