import fetch from 'node-fetch';
import moment from 'moment';

export const getPosts = async (req, res) => {
  const page = req.params ? req.params.page || 1 : 1;
  const postsPerPage = 10;
  const data = await fetch(
    `https://public-api.wordpress.com/rest/v1.1/sites/graceoncampusucla.wordpress.com/posts?fields=ID,featured_image,title,date,excerpt,attachments&page=${page}&number=${postsPerPage}`,
  );
  const dataParsed = await data.json();
  const { posts } = dataParsed;
  const result = posts.map((post) => {
    const image = post.featured_image
      ? post.featured_image
      : Object.values(post.attachments).length
        ? Object.values(post.attachments)[0].URL
        : null;
    const date = moment(post.date).format('MMMM DD, YYYY');
    return {
      ...post,
      excerpt: post.excerpt.replace(
        '[&hellip;]',
        `<a href="/blog/${post.ID}">... continue reading<a>`,
      ),
      image,
      date,
    };
  });
  const pageNumber = parseInt(page, 10);
  const maxPages = Math.ceil(parseInt(dataParsed.found, 10) / postsPerPage);
  res.render('blog.ejs', {
    title: 'Blog',
    posts: result,
    currentPage: pageNumber,
    nextPage: pageNumber < maxPages ? pageNumber + 1 : null,
    previousPage: pageNumber === 1 ? null : pageNumber - 1,
    pages: Array.from(Array(maxPages), (x, i) => i + 1),
  });
};

export const getPost = async (req, res) => {
  const id = req.params.postID;
  const data = await fetch(
    `https://public-api.wordpress.com/rest/v1.1/sites/graceoncampusucla.wordpress.com/posts/${id}`,
  );
  const post = await data.json();
  const image = post.featured_image
    ? post.featured_image
    : Object.values(post.attachments).length
      ? Object.values(post.attachments)[0].URL
      : null;
  const result = {
    ...post,
    image,
    date: moment(post.date).format('MMMM DD, YYYY'),
  };

  res.render('post.ejs', {
    title: post.title,
    post: result,
  });
};
