import moment from 'moment';
import admin from 'firebase-admin';
import _ from 'lodash';
import { replaceURLsWithLinks } from '../lib';

export const getAnnouncements = async(req, res) => {
    let posts = await admin.database().ref('/posts').once('value');
    posts = _.values(posts.val()).reverse()
    const finalPosts = []
    for (let post of posts) {
        const formattedPost = replaceURLsWithLinks(post.Post)
        post.date = moment.unix(post.Time).fromNow();
        post.Post = formattedPost
        console.log(post.Post)
        finalPosts.push(post)
    }
    res.render('announcements.ejs', {
        title: 'Announcements',
        posts: finalPosts
    });
};