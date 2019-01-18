import moment from 'moment';
import { firestoreDB } from '../firebase'
import _ from 'lodash';
import { replaceURLsWithLinks } from '../lib';

export const getAnnouncements = (req, res) => {
    firestoreDB.collection('announcements').get().then((snapshot) => {
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
