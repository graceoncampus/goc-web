import { mailgun } from '../lib';

export const postSGInterest = async (req, res) => {
  const sheetData = {
    Timestamp: new Date(),
    Name: req.body.name,
    Email: req.body.email,
  };
  try {
    const data = {
      to: 'kyledeguzman@ucla.edu',
      from: 'gocwebteam@gmail.com',
      subject: 'Small Group Interest',
      text:
        `${'Hi Kyle, '
          + '\n\n'
          + "There's a person named "}${
          sheetData.Name
        } interested in small group. It would be great if you could follow up with them!\n`
        + `Their email is: ${sheetData.Email}\n\n`
        + 'Thanks,\n'
        + 'GOC Web Team',
    };
    mailgun.messages().send(data);
  } catch (e) {
    console.error(e);
  }
  res.redirect('/smallgroups');
};

export const getSmallGroups = (req, res) => {
  res.render('smallgroups.ejs', {
    title: 'Small Groups',
  });
};

export const getSmallGroupsMen = (req, res) => {
  res.render('smallgroupsMen.ejs', {
    title: 'Men\'s Small Groups',
  });
};

export const getSmallGroupsWomen = (req, res) => {
  res.render('smallgroupsWomen.ejs', {
    title: 'Women\'s Small Groups',
  });
};
