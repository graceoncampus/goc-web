import CarouselDB from '../models/carousel.js';
import cloudinary from 'cloudinary';
import GoogleSpreadsheet from 'google-spreadsheet';
const newVisitorSheet = new GoogleSpreadsheet('1bHAPTG-HZ-OP8J_kuRe8iLPnAWLjzSFuhKr_iGonvbM');
import creds from '../config/goc-form-ca6452f3be85.json';
import mail from 'mailgun-js'
const mailgun = mail({
    apiKey: 'key-4d9b6eedc8a5b75c6a9e0b7eb49fa76c',
    domain: 'graceoncampus.org'
});
import moment from 'moment';
cloudinary.config({
  cloud_name: 'goc',
  api_key: '328772992973127',
  api_secret: '4Fsxb3XmB4IEpMTcPgj6cqIr3_w'
});
import formidable from 'formidable';

export const getRoot = (req, res) => {
    CarouselDB.find({}, function (err, c) {
        if (err || !c) {
            c = [];
        }
        res.render('index.ejs', {
            title: 'Grace on Campus',
            carousels: c.sort(function (a, b) {
                return a.rank - b.rank;
            })
        });
    });
};
export const postNewVisitor = function (req, res) {
    var sheetData = {
        "Timestamp": new Date(),
        "Name": req.body.name,
        "Email": req.body.email
    };
    newVisitorSheet.useServiceAccountAuth(creds, function (err) {
        newVisitorSheet.addRow(1, sheetData);
    });

    var data = {
        to: 'gocwelcome@gmail.com',
        from: 'gocwebteam@gmail.com',
        subject: 'Newcomer',
        text: 'Hi Welcome and Follow Up Team, ' + '\n\n' +
            'There\'s a newcomer named ' + sheetData.Name + '. It would be great if you could follow up with them!\n' +
            'Their email is: ' + sheetData.Email + '\n\n' +
            'Thanks,\n' +
            'GOC Web Team'
    };
    mailgun.messages().send(data);
    res.redirect('/');
};
export const getLeadership = (req, res) => {
    res.render('leadership.ejs', {
        title: 'Leadership'
    });
};
export const getAbout = (req, res) => {
    res.render('about.ejs', {
        title: 'About',
        user: req.user,
    });
};
export const getConnect = (req, res) => {
    res.render('connect.ejs', {
        title: 'Connect'
    });
};
export const getCarousels = (req, res) => {
    CarouselDB.find().exec(function (err, results) {
        res.render('carousel.ejs', {
            carousels: results.sort(function (a, b) {
                return a.rank - b.rank;
            })
        });
    });
};
export const getEditCarouselById = (req, res) => {
    CarouselDB.findById(req.params.cid, function (e, r) {
        if (e) {
            res.send("Error, couldnt find that carousel");
        } else {
            res.render('editcarousel.ejs', {
                carousel: r
            });
        }
    });
};
export const postEditCarouselById = (req, res) => {
    CarouselDB.findById(req.params.cid, function (e, carousel) {
	var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
		if(fields.rank) carousel.rank = fields.rank;
		if(fields.uri) carousel.URI = fields.uri;
		if (files.background) {
			const path = files.background.path
        	        cloudinary.v2.uploader.upload(path, { eager: [
                        { width: 400, height: 300, crop: "pad" },
                        { width: 260, height: 200, crop: "crop", gravity: "north"} ]}, function(e, result) {
                		carousel.imageURI = `https://res.cloudinary.com/goc/image/upload/q_auto,f_auto,w_auto,dpr_auto/${result.public_id}.${format}`;
			});
                }
		carousel.save(function () {
                	res.redirect('/carousels');
                });
	});
    });
}
export const rmCarouselById = (req, res) => {
    CarouselDB.remove({
        _id: req.params.rmid
    }, function () {
        res.redirect('/carousels');
    });
};
export const postCarousel = async(req, res) => {
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
	    if (files.background) {
		const path = files.background.path
		var newCarousel = new CarouselDB();
	        newCarousel.URI = fields.uri;
	        newCarousel.rank = fields.rank;
       		cloudinary.v2.uploader.upload(path, function(e, result) {
		    newCarousel.imageURI = result.secure_url;
                    newCarousel.save(function () {
                        res.redirect('/carousels');
                    });
		});
	    } else {
		res.render('error.ejs', {
            		title: 'Error',
            		message: "You must provide an image"
        	});
	    }
	});
};
export const get404 = function (req, res) {
    res.render('404.ejs', {
        title: ":("
    });
};
