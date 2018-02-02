import moment from 'moment';
import admin from 'firebase-admin';
import _ from 'lodash';

export const getCalendar = async(req, res) => {
    res.render('calendar.ejs', {
        title: 'Calendar'
    });
};
