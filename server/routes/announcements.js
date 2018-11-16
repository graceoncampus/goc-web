import moment from 'moment';
import admin from 'firebase-admin'
import _ from 'lodash';
import { replaceURLsWithLinks } from '../lib';

export const getAnnouncements = async(req, res) => {
    let posts = admin.firestore().collection('announcements').get().then((snapshot) => {
    const finalPosts = []
    snapshot.forEach((doc) => {
      let post = doc.data()
      var formattedPost = replaceURLsWithLinks(post.post)
      formattedPost = formattedPost.replace(/\n/g, "<br/>");
      post.Post = formattedPost
      finalPosts.push(post)
    });
    res.render('announcements.ejs', {
        title: 'Announcements',
        posts: finalPosts
    });
  })
  .catch((err) => {
    console.log('Error getting documents', err);
  });
};
