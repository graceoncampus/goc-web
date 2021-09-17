import mail from 'mailgun-js';
import admin from 'firebase-admin';
import firebaseSignup from '../auth/signup';
import { FIREBASE_CONFIG } from '../config/firebaseConfig';

const invitedRef = admin.firestore().collection('invitedUsers');
const usersRef = admin.firestore().collection('users');

const mailgun = mail({ apiKey: 'key-4d9b6eedc8a5b75c6a9e0b7eb49fa76c', domain: 'graceoncampus.org' });

export const getLogin = (req, res) => {
  res.render('login.ejs', {
    config: FIREBASE_CONFIG,
  });
};

export const postLogin = (req, res) => {
  res.json({
    redirect: '/',
  });
};

export const getForgot = (req, res) => {
  res.render('forgot.ejs', {
    title: 'Forgot password',
    config: FIREBASE_CONFIG,
  });
};

export const getLoginRedirect = (req, res) => {
  const destination = req.originalUrl.split('/login/redir/').pop();
  res.render('login.ejs', {
    redirect: (destination) ? `/redir/${destination}` : '',
    config: FIREBASE_CONFIG,
  });
};

export const postLoginRedirect = (req, res) => {
  const destination = `/${req.originalUrl.split('/login/redir/').pop()}`;
  res.json({
    redirect: (destination) || '',
  });
};

export const getLogout = (req, res) => {
  req.logout();
  res.redirect('/');
};

export const getSignup = (req, res) => {
  res.render('signup.ejs');
};

export const postSignup = (req, res, next) => {
  firebaseSignup.authenticate('signup', (err, user) => {
    if (err) { return res.json(err); }
    if (user) { return res.json(''); }
    return res.json('unknown error');
  })(req, res, next);
};

export const getInvite = (req, res) => {
  res.render('invite.ejs');
};

export const postInvite = (req, res) => {
  const emailStr = req.body.email;
  const email = emailStr.toLowerCase();
  const postData = {
    email,
  };

  invitedRef.where('email', '==', email).get().then((snapshot) => {
    if (!snapshot.empty) {
      res.json('failure');
    } else {
      usersRef.where('email', '==', email).get().then((snapshot2) => {
        if (!snapshot2.empty) {
          res.json('failure');
        } else {
          invitedRef.add(postData).then(() => {
            const data = {
              to: email,
              from: 'Grace on Campus <gocwebteam@gmail.com>',
              subject: 'GOC Online Invitation',
              text: `Welcome!\nYou just got invited to sign up for Grace on Campus Online. You can use our website or mobile app to sign up for classes and rides, find out about upcoming events, and receive news about our ministry on the fly. You can create an account on the app or using our website (graceoncampus.org/signup).\nYou can download the app here: http://onelink.to/dtakuu.\n\nFor reference, here's the email that was invited: ${email}\n\nIf you have any questions, feel free to email us at gocwebteam@gmail.com. We'll get back to you as soon as possible!\n\n\nBy His Grace Alone,\nGOC Web Team`,
              html: `<!DOCTYPE html><html xmlns=http://www.w3.org/1999/xhtml xmlns=http://www.w3.org/1999/xhtml><meta content="width=device-width,initial-scale=1"name=viewport><meta content="text/html; charset=UTF-8"http-equiv=Content-Type><title>Welcome to Grace on Campus!</title><style>@media (max-width:600px){.email-content{margin:0!important}}@media (max-width:600px){.email-body_inner{width:100%!important}.email-footer{width:100%!important}}</style><body bgcolor=#F2F4F6 style="width:100%!important;height:100%;margin:0;line-height:1.4;background-color:#f2f4f6;color:#3a3f4b;-webkit-text-size-adjust:none;box-sizing:border-box;color:#3a3f4b;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;height:100%;line-height:1.4;margin:0;width:100%!important"><style>@media (max-width:600px){.email-content{margin:0!important}}@media (max-width:600px){.email-body_inner{width:100%!important}.email-footer{width:100%!important}}</style><table cellpadding=0 cellspacing=0 style="box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;padding:0;width:100%"width=100% class=email-wrapper bgcolor=#f9f9f9><tr><td style="box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;word-break:break-word"align=center><table cellpadding=0 cellspacing=0 style="max-width:600px;margin:24px 0;border-radius:3px;box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:0;width:100%"width=100% class=email-content><tr><td style="box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:25px 0;word-break:break-word"class=email-masthead align=center><a href=https://example.com style="box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;text-decoration:none;text-shadow:0 1px 0 #fff"class=email-masthead_name><img src=https://res.cloudinary.com/goc/image/upload/v1507845999/Fill-16_ozm9l3.png style="margin:30px 0;max-width:200px;text-align:center"></a><tr><td style="-premailer-cellpadding:0;-premailer-cellspacing:0;border-bottom-color:#ecedef;border-bottom-style:solid;border-bottom-width:1px;border-top-color:#ecedef;border-top-style:solid;border-top-width:1px;box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;padding:0;width:100%;word-break:break-word"class=email-body bgcolor=#FFFFFF cellpadding=0 cellspacing=0 width=100%><table cellpadding=0 cellspacing=0 style="box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 auto;padding:0;width:570px"width=570 class=email-body_inner align=center bgcolor=#FFFFFF><tr><td style="box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:35px;word-break:break-word"class=content-cell><h1 align=left style="box-sizing:border-box;color:#04164d;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:34px;font-weight:400;margin-top:0">Welcome!</h1><p align=left style="box-sizing:border-box;color:#3a3f4b;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:18px;line-height:1.5em;margin:0">You just got invited to sign up for Grace on Campus Online. You can use our website or mobile app to sign up for classes and rides, find out about upcoming events, and receive news about our ministry on the fly. You can create an account on the app or using our <a href=https://graceoncampus.org/signup style=text-decoration:none;color:#539ab9>website (graceoncampus.org/signup)</a>.<table cellpadding=0 cellspacing=0 style="box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:30px auto;padding:0;text-align:center;width:100%"width=100% class=body-action align=center><tr><td style="box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;word-break:break-word"align=center><table cellpadding=0 cellspacing=0 style="box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif"width=100% border=0><tr><td style="box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;word-break:break-word"align=center><table cellpadding=0 cellspacing=0 style="box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif"border=0><tr><td style="box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;word-break:break-word"><a href=http://onelink.to/dtakuu style="-webkit-text-size-adjust:none;font-size:15px;text-transform:uppercase;background-color:#539ab9;border-radius:6px;padding:18px 27px;width:200px;text-align:center;border:none;letter-spacing:1px;box-sizing:border-box;color:#fff;display:inline-block;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;text-decoration:none"class="button button--"target=_blank>Get the App</a></table></table></table><p align=left style="box-sizing:border-box;color:#3a3f4b;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:18px;line-height:1.5em;margin-top:0">For reference, here's the email that was invited:<table cellpadding=0 cellspacing=0 style="border:1px solid rgba(0,0,0,.125);border-radius:5px;box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 21px"width=100% class=attributes><tr><td style="box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:16px;word-break:break-word"class=attributes_content bgcolor=#fff><table cellpadding=0 cellspacing=0 style="box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif"width=100%><tr><td style="color:#3a3f4b;box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:0;word-break:break-word;font-size:18px"class=attributes_item><span style=font-size:14px;letter-spacing:.5px;color:#848895>Email</span><br>${email}</table></table><p align=left style="box-sizing:border-box;color:#3a3f4b;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:18px;line-height:1.5em;margin-top:0">If you have any questions, feel free to <a href=mailto:gocwebteam@gmail.com style="box-sizing:border-box;text-decoration:none;color:#539ab9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">email us</a>. We'll get back to you as soon as possible!<p align=left style="box-sizing:border-box;color:#3a3f4b;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:18px;line-height:1.5em;margin-top:0">By His Grace Alone,<br>GOC Web Team</table><tr><td style="box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;word-break:break-word"><table cellpadding=0 cellspacing=0 style="box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 auto;padding:0;text-align:center;width:570px"width=570 class=email-footer align=center><tr><td style="box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:35px 35px 0;word-break:break-word"class=content-cell align=center><p align=center style="box-sizing:border-box;color:#aeaeae;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5em;margin-top:0"class="align-center sub">© 2017 <a href=https://graceoncampus.org style=text-decoration:none;color:#539ab9>Grace on Campus</a><br>A Ministry of <a href=https://gracechurch.org style=text-decoration:none;color:#539ab9>Grace Community Church</a></table></table></table>`,
            };
            mailgun.messages().send(data);
          });
          res.json('success');
        }
      });
    }
  });
};

export const getChangePassword = (req, res) => {
  res.render('changePassword.ejs', {
    config: FIREBASE_CONFIG,
  });
}