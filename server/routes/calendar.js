import moment from 'moment';
import admin from 'firebase-admin';
import _ from 'lodash';

export const getCalendar = async(req, res) => {
    let data = await admin.database().ref('/calendar/events').once('value');
    res.render('calendar.ejs', {
        events: data.val(),
        title: 'Calendar'
    });
};
