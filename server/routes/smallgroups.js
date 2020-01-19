import moment from 'moment';
import cloudinary from 'cloudinary';
import formidable from 'formidable';
import admin from 'firebase-admin';
import { promisify } from 'util';
import { replaceURLsWithLinks } from '../lib';

const sgRef = admin.firestore().collection('smallgroups');

/*
getSmallGroups gets small groups 
*/
export const getSmallGroups = async (req, res) => {
    /*try {
        const m_sgs = await sgRef.doc("men_sgs").get();
        const malesgs = [];
        if(!m_sgs.empty){
            m_sgs.forEach((doc) => {
                const tempSg = doc.data();
                console.log("email: " + tempSg.email);
                malesgs.push(m_sgs);
            });
        }
        const f_sgs = await sgRef.doc("women_sgs").get();
        const womensgs = [];
        if(!f_sgs.empty){
            f_sgs.forEach((doc) => {
                const tempSg = doc.data();
                console.log("email: " + tempSg.email);
                womensgs.push(f_sgs);
            });
        }
        res.render('smallgroups.ejs', {
            title: 'Small Groups',
            mgs: malesgs,
            fgs: womensgs,
        })

    }catch(e) {
        res.status(500).json(e);
    }*/
    try {
      const msg = await sgRef.doc('men').collection('men_sgs').get();
      const menSgs = [];
        if (!msg.empty) {
          msg.forEach((doc) => {
            if (doc.exists) {
              const course = doc.data();
              menSgs.push(course);
            }
          });
        }
      const fsg = await sgRef.doc('women').collection('women_sgs').get();
      const womenSgs = [];
        if(!fsg.empty){
            fsg.forEach((doc) => {
              if(doc.exists) {
                const course = doc.data();
                womenSgs.push(course);
              }
            })
        }
        res.render('smallgroups.ejs', {
          title: 'Small Groups',
          menSgs,
          womenSgs,
        });
      } catch (e) {
        res.status(500).json(e);
      }
};
  