import cloudinary from 'cloudinary';
import GoogleSpreadsheet from 'google-spreadsheet';
import formidable from 'formidable';
import admin from 'firebase-admin';
import { promisify } from 'util';
import creds from '../config/goc-form-ca6452f3be85.json';
import { mailgun } from '../lib';

//const newVisitorSheet = new GoogleSpreadsheet(process.env.NEW_VISITOR_SHEET); //TODO RM 
const newVisitorSheetDoc = new GoogleSpreadsheet(process.env.NEW_VISITOR_SHEET);
const carouselRef = admin.firestore().collection('carousels');

export const getRoot = async (req, res) => {
  let carousels = [];
  try {
    const snapshot = await carouselRef.orderBy('rank').get();
    if (!snapshot.empty) {
      carousels = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (e) {
    console.error(e);
  }
  res.render('index.ejs', {
    title: 'Grace on Campus',
    carousels,
  });
};

export const postNewVisitor = async (req, res) => {
  const sheetData = {
    Timestamp: new Date(),
    Name: req.body.name,
    Email: req.body.email,
  };
  try {
//    await promisify(newVisitorSheet.useServiceAccountAuth)(creds);
    await promisify(newVisitorSheetDoc.useServiceAccountAuth)(creds);
    await newVisitorSheetDoc.loadInfo();
    const newVisitorSheet = newVisitorSheetDoc.sheetsByIndex[0];
    newVisitorSheet.addRow(1, sheetData); //TODO CHECK
    const data = {
      to: 'gocwelcome@gmail.com',
      from: 'gocwebteam@gmail.com',
      subject: 'Newcomer',
      text:
        `${'Hi Welcome and Follow Up Team, '
          + '\n\n'
          + "There's a newcomer named "}${
          sheetData.Name
        }. It would be great if you could follow up with them!\n`
        + `Their email is: ${sheetData.Email}\n\n`
        + 'Thanks,\n'
        + 'GOC Web Team',
    };
    mailgun.messages().send(data);
  } catch (e) {
    console.error(e);
  }
  res.redirect('/');
};

// export const getLeadership = (req, res) => {
//   res.render('leadership.ejs', {
//     title: 'Leadership',
//   });
// };
export const getAbout = (req, res) => {
  res.render('about.ejs', {
    title: 'About',
    user: req.user,
  });
};
export const getSG = (req, res) => {
  res.render('smallgroup.ejs', {
    title: 'Small Groups',
  });
};
export const getCarousels = async (req, res) => {
  let carousels = [];
  const snapshot = await carouselRef.orderBy('rank').get();
  if (!snapshot.empty) {
    carousels = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  res.render('carousel.ejs', {
    carousels,
  });
};

export const getEditCarouselById = async (req, res) => {
  const { cid } = req.params;
  try {
    const doc = await carouselRef.doc(cid).get();
    if (!doc.exists) res.status(500).json('Couldn\'t find specified carousel');
    res.render('editcarousel.ejs', {
      carousel: doc.data(),
    });
  } catch (e) {
    console.error(e);
  }
};

export const postEditCarouselById = (req, res) => {
  const { cid } = req.params;
  if (!cid) res.status(500).json('Invalid id');
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    let path;
    const {
      rank,
      uri,
    } = fields;
    if (files && files.background && files.background.path) {
      ({ path } = files.background);
    }
    let image;
    try {
      if (path) {
        const result = await promisify(cloudinary.v2.uploader.upload)(path, {
          eager: [
            { width: 400, height: 300, crop: 'pad' },
            {
              width: 260,
              height: 200,
              crop: 'crop',
              gravity: 'north',
            },
          ],
        });
        if (result && result.public_id) {
          image = `https://res.cloudinary.com/goc/image/upload/q_auto,f_auto,w_auto,dpr_auto/${
            result.public_id
          }.${result.format}`;
        }
      }
      await carouselRef.doc(cid)
        .update({
          rank,
          uri,
          image,
        });
      res.redirect('/carousels');
    } catch (e) {
      res.status(500).json(e);
    }
  });
};

export const rmCarouselById = async (req, res) => {
  const { cid } = req.params;
  if (!cid) res.status(500).json('Invalid id');
  try {
    carouselRef.doc(cid).delete();
  } catch (e) {
    res.status(500).json(e);
  }
};

export const postCarousel = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    let path;
    const {
      rank,
      uri,
    } = fields;
    if (files && files.background && files.background.path) {
      ({ path } = files.background);
    }
    let image;
    try {
      if (path) {
        const result = await promisify(cloudinary.v2.uploader.upload)(path, {
          eager: [
            { width: 400, height: 300, crop: 'pad' },
            {
              width: 260,
              height: 200,
              crop: 'crop',
              gravity: 'north',
            },
          ],
        });
        if (result && result.public_id) {
          image = `https://res.cloudinary.com/goc/image/upload/q_auto,f_auto,w_auto,dpr_auto/${
            result.public_id
          }.${result.format}`;
        }
      }
      await carouselRef.add({
        rank,
        uri,
        image,
      });
      res.redirect('/carousels');
    } catch (e) {
      res.status(500).json(e);
    }
  });
};

export const get404 = (req, res) => res.render('404.ejs', {
  title: ':(',
});
