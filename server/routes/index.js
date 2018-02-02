import express from 'express';
const router = express();

import {
    isLoggedIn,
    isNotLoggedIn
} from '../lib';
import {
    getAnnouncements
} from './announcements'
import {
    getCalendar
} from './calendar'
import {
    postNotify,
    postRidesNotify
} from './notifications'
import {
    getLogin,
    getLoginRedirect,
    postLogin,
    postLoginRedirect,
    getSignup,
    postSignup,
    getInvite,
    postInvite,
    getForgot,
    getLogout
} from './auth.js';
import {
    getEvents,
    postEvent,
    getEditEventById,
    postEditEventById,
    postDeleteEventById
} from './event.js';
import {
    getClassById,
    getClasses,
    getEditClassById,
    postClass,
    postEditClassById,
    postDeleteClassById,
    enrollStudent,
    unenrollStudent
} from './class.js';
import {
    getRoot,
    postNewVisitor,
    getLeadership,
    getAbout,
    getConnect,
    getCarousels,
    postCarousel,
    getEditCarouselById,
    postEditCarouselById,
    rmCarouselById,
    get404
} from './home.js';
import {
    getSermons,
    postSermon,
    getEditSermonById,
    postEditSermonById
} from './sermon.js';
import {
    getProfile,
    postProfileEdit,
    postRoster,
    getRoster,
    getUserById
} from './user.js';
import {
    getRides,
    getRidesSignup,
    updateRides
} from './rides.js';
import firebaseLogin from '../auth/login';

router.get('/', getRoot);
router.get('/announcements', isLoggedIn, getAnnouncements)
router.get('/calendar', isLoggedIn, getCalendar)

router.post('/newvisitor', postNewVisitor);
router.get('/leadership', getLeadership);
router.get('/about', getAbout);
router.get('/connect', getConnect);

router.get('/rides', getRides);
router.get('/rides/signup', getRidesSignup);
router.post('/rides/update', updateRides);
// router.post('/rides/delete', rides.delete);

router.get('/carousels', isLoggedIn, getCarousels);
router.post('/carousels', isLoggedIn, postCarousel);
router.get('/carousels/edit/:cid',isLoggedIn, getEditCarouselById);
router.post('/carousels/edit/:cid',isLoggedIn, postEditCarouselById);
router.get('/carousels/rm/:rmid',isLoggedIn, rmCarouselById);

router.get('/login', isNotLoggedIn, getLogin);
router.post('/login', firebaseLogin.authenticate('login'), postLogin);
router.get('/login/redir/*', isNotLoggedIn, getLoginRedirect);
router.post('/login/redir/*', firebaseLogin.authenticate('login'), postLoginRedirect);
router.get('/signup', isNotLoggedIn, getSignup);
router.post('/signup', postSignup);
router.get('/logout', isLoggedIn, getLogout);

router.get('/invite', isLoggedIn, getInvite);
router.post('/invitation', postInvite);
router.get('/forgot', isNotLoggedIn, getForgot);
// user
router.get('/profile', isLoggedIn, getProfile);
router.post('/profile', isLoggedIn, postProfileEdit);
router.get('/roster', isLoggedIn, getRoster);
router.get('/events', getEvents);
router.post('/events', postEvent);
router.get('/e/edit/:eventid', getEditEventById);
router.post('/e/edit/:eventid', postEditEventById);
router.post('/e/delete/:eventid', postDeleteEventById);
// classes
router.get('/classes', isLoggedIn, getClasses);
router.get('/c/:classID', isLoggedIn, getClassById);
router.post('/classes/enroll', isLoggedIn, enrollStudent);
router.post('/classes/unenroll', isLoggedIn, unenrollStudent);

router.post('/classes', postClass);
router.post('/c/delete/:classID', postDeleteClassById);
router.get('/c/edit/:classID', getEditClassById);
router.post('/c/edit/:classID', postEditClassById);
// sermons
router.get('/sermons', getSermons);
router.post('/sermons', postSermon);
router.get('/sermons/edit/:sermonid', getEditSermonById);
router.post('/sermons/edit/:sermonid', postEditSermonById);
router.post('/notifications', postNotify);
router.post('/ridesNotify', postRidesNotify);
router.use(get404);

export default router;
