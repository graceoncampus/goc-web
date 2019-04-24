import _ from './env';
import express from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import morgan from 'morgan';
import admin from 'firebase-admin';
import cloudinary from 'cloudinary';
import routes from './routes';
import { mailgun } from './lib';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


let isFetched = false;
admin.firestore().collection('ridesSignup').onSnapshot((snapshot) => {
  const date = new Date();
  const day = date.getDay();
  const hour = date.getHours();
  if (day === 6 && hour === 21) {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const { name, driver } = change.doc.data();
        if (name !== undefined && isFetched) {
          let message = '';
          if (driver) {
            message = 'Someone just signed up to drive to church this Sunday!';
          } else {
            message = 'Someone just signed up for a ride to church this Sunday!';
          }
          const data = {
            to: 'gocrides@gmail.com',
            from: 'Grace on Campus Web Team <gocwebteam@gmail.com>',
            subject: 'New Rides Signup',
            text: message,
            html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns="http://www.w3.org/1999/xhtml"><head> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/> <title>Welcome to Grace on Campus!</title> <style type="text/css"> @media (max-width: 600px){.email-content{margin: 0 !important;}}@media (max-width: 600px){.email-body_inner{width: 100% !important;}.email-footer{width: 100% !important;}}</style></head><body style="width: 100% !important; height: 100%; margin: 0; line-height: 1.4; background-color: #F2F4F6; color: #3a3f4b; -webkit-text-size-adjust: none; box-sizing: border-box; color: #3a3f4b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; height: 100%; line-height: 1.4; margin: 0; width: 100% !important;" bgcolor="#F2F4F6"> <style type="text/css"> @media (max-width: 600px){.email-content{margin: 0 !important;}}@media (max-width: 600px){.email-body_inner{width: 100% !important;}.email-footer{width: 100% !important;}}</style> <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; width: 100%;" bgcolor="#f9f9f9"> <tr> <td align="center" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; word-break: break-word;"> <table class="email-content" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 24px 0; border-radius: 3px; box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 0; width: 100%;"> <tr> <td class="email-masthead" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 25px 0; word-break: break-word;" align="center"> <a href="https://example.com" class="email-masthead_name" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: bold; text-decoration: none; text-shadow: 0 1px 0 white;"> <img style="margin: 30px 0; max-width: 200px; text-align: center" src="https://res.cloudinary.com/goc/image/upload/v1507845999/Fill-16_ozm9l3.png"/> </a> </td></tr><tr> <td class="email-body" width="100%" cellpadding="0" cellspacing="0" style="-premailer-cellpadding: 0; -premailer-cellspacing: 0; border-bottom-color: #ecedef; border-bottom-style: solid; border-bottom-width: 1px; border-top-color: #ecedef; border-top-style: solid; border-top-width: 1px; box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; width: 100%; word-break: break-word;" bgcolor="#FFFFFF"> <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0 auto; padding: 0; width: 570px;" bgcolor="#FFFFFF"> <tr> <td class="content-cell" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 35px; word-break: break-word;"> <h1 style="box-sizing: border-box; color: #04164d; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 34px; font-weight: normal; margin-top: 0;" align="left">Good evening,</h1> <p style="box-sizing: border-box; color: #3a3f4b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; line-height: 1.5em; margin: 0;" align="left">${message}<br/></br/> <table class="attributes" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid rgba(0,0,0,.125); border-radius: 5px;box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0 0 21px;"> <tr> <td class="attributes_content" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 16px; word-break: break-word;" bgcolor="#fff"> <table width="100%" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;"> <tr> <td class="attributes_item" style="color:#3a3f4b; box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 0; word-break: break-word;font-size:18px"> <span style="font-size:14px; letter-spacing: 0.5px; color:#848895">New Driver/Rider</span> <br/>${name}</td></tr></table> </td></tr></table> <p style="box-sizing: border-box; color: #3a3f4b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; line-height: 1.5em; margin-top: 0;" align="left">We Love You Guys, <br/>GOC Web Team</p></td></tr></table> </td></tr><tr> <td style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; word-break: break-word;"> <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0 auto; padding: 0; text-align: center; width: 570px;"> <tr> <td class="content-cell" align="center" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 35px 35px 0; word-break: break-word;"> <p class="sub align-center" style="box-sizing: border-box; color: #AEAEAE; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.5em; margin-top: 0;" align="center">© 2017 <a style="text-decoration: none;color:#ae956b" href="https://graceoncampus.org">Grace on Campus</a> <br/>A Ministry of <a style="text-decoration: none;color:#ae956b" href="https://gracechurch.org">Grace Community Church</a> </p></td></tr></table> </td></tr></table> </td></tr></table></body></html>`,
          };
          mailgun.messages().send(data); // send email to driver
        }
      }
    });
    isFetched = true;
  }
});
const app = express();
app.set('view engine', 'ejs'); // set up ejs for templating
app.set('views', './views');
const env = process.env.NODE_ENV || 'development';
if (env === 'development') {
  app.use(express.static('public'));
}
app.use(morgan('dev'));
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SECRET],
  maxAge: 24 * 60 * 60 * 1000,
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.title = '';
  next();
});

app.use('/', routes);

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

app.listen(3000);
