import express from 'express';

import { isLoggedIn, isNotLoggedIn } from '../lib';
import { getAnnouncements } from './announcements';
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
  getLogout,
} from './auth';
import {
  getEvents,
  getEditEventById,
  postEditEventById,
  postDeleteEventById,
  getCalendarResources,
} from './event';
import {
  getClassById,
  getClasses,
  getEditClassById,
  postClass,
  postEditClassById,
  postDeleteClassById,
  enrollStudent,
  unenrollStudent,
  getViewClassRosterById,
} from './class';
import {
  getSmallGroups,
  postSGInterest,
} from './smallgroups'
import {
  getRoot,
  postNewVisitor,
  getBeliefs,
  getAbout,
  getCarousels,
  postCarousel,
  getEditCarouselById,
  postEditCarouselById,
  rmCarouselById,
  get404,
} from './home';
import {
  getSermons
} from './sermon';
import { getProfile, postProfileEdit, getRoster } from './user';
import {
  getRides, getRidesSignup, updateRides, notifyRiders,
} from './rides';
import { getPosts, getPost } from './blog';
import {
  getResources,
  getEditResources,
  postEditResources,
} from './resources';
import firebaseLogin from '../auth/login';

const router = express();

router.get('/', getRoot);
router.get('/announcements', isLoggedIn, getAnnouncements);


router.post('/newvisitor', postNewVisitor);
router.get('/ourbeliefs', getBeliefs);
router.get('/about', getAbout);

router.get('/smallgroups', getSmallGroups);
router.post('/sginterest', postSGInterest)

router.get('/rides', getRides);
router.get('/rides/signup', getRidesSignup);
router.post('/rides/update', updateRides);
router.post('/rides/notify', notifyRiders);
// router.post('/rides/delete', rides.delete);

router.get('/carousels', isLoggedIn, getCarousels);
router.post('/carousels', isLoggedIn, postCarousel);
router.get('/carousels/edit/:cid', isLoggedIn, getEditCarouselById);
router.post('/carousels/edit/:cid', isLoggedIn, postEditCarouselById);
router.get('/carousels/rm/:cid', isLoggedIn, rmCarouselById);

router.get('/login', isNotLoggedIn, getLogin);
router.post('/login', firebaseLogin.authenticate('login'), postLogin);
router.get('/login/redir/*', isNotLoggedIn, getLoginRedirect);
router.post(
  '/login/redir/*',
  firebaseLogin.authenticate('login'),
  postLoginRedirect,
);
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

//events page
router.get('/events', getEvents);
router.post('/events', postEditEventById);
router.get('/events/resources', getCalendarResources);
router.get('/e/edit/:eventid', getEditEventById);
router.post('/e/edit/:eventid', postEditEventById);
router.post('/e/delete/:eventid', postDeleteEventById);

// classes
router.get('/classes', getClasses);
router.get('/c/:classID', getClassById);
router.post('/classes/enroll', enrollStudent);
router.post('/classes/unenroll', unenrollStudent);

router.post('/classes', postClass);
router.post('/c/delete/:classID', postDeleteClassById);
router.get('/c/edit/:classID', getEditClassById);
router.post('/c/edit/:classID', postEditClassById);
router.get('/c/view/:classID', getViewClassRosterById);
// sermons
router.get('/sermons', getSermons);
router.get('/sermons/page/:page', getSermons);

// blog
router.get('/blog/:postID', getPost);
router.get('/blog/', getPosts);
router.get('/blog/page/:page', getPosts);

// resources
router.get('/resources', getResources);
router.get('/resources/edit', getEditResources);
router.post('/resources/edit', postEditResources);

router.use(get404);

export default router;
