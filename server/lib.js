var _ = require('lodash');
var admin = require('firebase-admin');
var firebaseDB = admin.database();

export const lookupByUID = async (uid) => {
    const user = await admin.database().ref(`users/${uid}`).once('value');
    if (!user.val()) return uid
    return `${user.val().firstName} ${user.val().lastName}`;
};

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
