import moment from 'moment';
import admin from 'firebase-admin';

const usersRef = admin.firestore().collection('users');

export const getProfile = (req, res) => {
  const { user } = req;
  user.bday = moment.unix(user.birthday).format('YYYY-MM-DD');
  res.render('profile.ejs', {
    title: 'Profile',
    user,
  });
};

export const postProfileEdit = async (req, res) => {
  const {
    firstName,
    lastName,
    phoneNumber,
    birthday,
    homechurch,
    gradyear,
    major,
    address,
  } = req.body;
  const uid = req.user.id;
  const { email, permissions } = req.user;
  const bday = moment(birthday).unix();
  const usr = {
    email,
    permissions,
    firstName,
    lastName,
    phoneNumber,
    birthday: bday,
    homeChurch: homechurch,
    grad: gradyear,
    major,
    address,
  };
  try {
    await usersRef.doc(uid).update(usr);
    res.json('success');
  } catch (err) {
    res.json(err.message);
  }
};

export const getRoster = async (req, res) => {
  const userSnapshot = await usersRef.get();
  let users = [];
  if (!userSnapshot.empty) {
    users = userSnapshot.docs.map((u) => {
      const data = u.data();
      const bday = moment.unix(data.birthday).format('MMMM Do, YYYY');
      return ({ id: u.id, bday, ...data });
    });
  }
  res.render('roster.ejs', {
    title: 'Roster',
    users, // get the user out of session and pass to template
  });
};