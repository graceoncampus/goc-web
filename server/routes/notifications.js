import admin from 'firebase-admin';
import _ from 'lodash';
import fetch from 'node-fetch';

const fetchNow = async(messages) => {
    for (let message of messages) {
        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'accept': 'application/json',
                'accept-encoding': 'gzip, deflate',
                'content-type': 'application/json',
            },
            body: JSON.stringify(message),
        });
    }
}

export const postNotify = async (req, res) => {
    if (req.body.token === 'GOC2017!') {
        const tokens = await admin.database().ref('tokens').once('value')
        const recipients = [];
        _.values(tokens.val()).forEach(token => (recipients.push(token)));
        let messages = [];
        recipients.forEach(to => (messages.push({
            to: to,
            title: req.body.title,
            body: req.body.post
        })));
        await fetchNow(messages);
        res.json('sent');
    }
}
export const postRidesNotify = async (req, res) => {
    if (req.body.token === 'GOC2017!') {
        const snapshot = await admin.database().ref('rides').orderByKey().limitToFirst(1).once('value')
        const thisKey = Object.keys(snapshot.val())[0];
        const allCars = snapshot.val()[thisKey].cars;
        const cars = _.values(allCars)
        for (let car of cars) {
            const riders = _.values(car.riders)
            const recipients = []
            const driver = car.driver.name
            for (let rider of riders) {
                if(rider.uid!==''){
                    const token = await admin.database().ref(`users/${rider.uid}/token`).once('value')
                    if (token.val()) {
                        recipients.push(_.values(token.val()))
                    }
                }
            }
            let finalRecipe = _.flatten(recipients)
            let messages = [];
            const body = `Your driver to church this Sunday is ${driver}. Be at your respective pickup location at 7:45 AM. See you at church ⛪️!`
            finalRecipe.forEach(to => (messages.push({
                to,
                title: 'Rides',
                body,
            })));
            if (messages.length > 0) {
                await fetchNow(messages);
            }
        }
        res.json('sent');
    }
}
