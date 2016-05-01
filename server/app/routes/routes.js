const path = process.cwd();
import Event from '../models/event';
import User from '../models/users';
import passport from 'passport';

const generateID = () => {
  let ID = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++) {
    ID += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return ID;
};

export default (app) => {
  /*
  ....###....########..####..######.
  ...##.##...##.....##..##..##....##
  ..##...##..##.....##..##..##......
  .##.....##.########...##...######.
  .#########.##.........##........##
  .##.....##.##.........##..##....##
  .##.....##.##........####..######.
  */

  /* auth stuff */

  app.route('/api/auth/current')
    .get((req, res) => {
      res.status(200).send(req.user);
    });

  app.route('/api/auth/github')
    .get(passport.authenticate('github'));

  app.route('/api/auth/github/callback')
    .get(passport.authenticate('github', {
      successRedirect: '/dashboard',
      failureRedirect: '/login',
    }));

  app.route('/api/auth/facebook')
    .get(passport.authenticate('facebook'));

  app.route('/api/auth/facebook/callback')
    .get(passport.authenticate('facebook', {
      successRedirect: '/dashboard',
      failureRedirect: '/login',
    }));


  app.route('/api/auth/local/login')
    .post(passport.authenticate('login', {
      successRedirect: '/dashboard',
      failureRedirect: '/login',
    }));

  app.route('/api/auth/local/signup')
    .post(passport.authenticate('signup', {
      successRedirect: '/dashboard',
      failureRedirect: '/signup',
      failureFlash: true,
    }));

  app.route('/api/auth/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/');
    });

  /* meeetings API*/

  app.route('/api/events')
    .get((req, res) => {
      Event.find((err, events) => {
        if (err) res.status(500).send(err);
        return res.status(200).json(events);
      });
    })
    .post((req, res) => {
      console.log(req.body)
      Event.findOne({"uid": req.body.id}, (err,doc) => {
        if(err) return res.status(500).send(err)
        if(doc){
          let participants;
          // if(req.body.user.local){}
          // if(req.body.user.github){}
          if(req.body.user.facebook){
            if(doc.participants.length !== 0){
              participants = doc.participants;
              participants.map(user => {
                console.log(user.name, req.body.user.facebook.username, user.name === req.body.user.facebook.username)
                if(user.name === req.body.user.facebook.username){
                  user.availibility = req.body.data;
                }
                return user;
              })
            }
          }
          console.log(participants)
          doc.participants = participants;
          doc.markModified("participants");
          doc.save((err,doc) => {
            if(err) console.log(err);

            console.log(doc);
          });
          return;
        }
        req.body.uid = generateID();
        Event.create(req.body, (err, event) => {
          if (err) return res.status(500).send(err);
          return res.status(201).json(event);
        });
      })
    });

  /* users API */

  app.route('/api/users')
    .get((req, res) => {
      User.find((err, users) => {
        if (err) res.status(500).send(err);
        return res.status(200).json(users);
      });
    });

  app.route('*')
    .get((req, res) => res.sendFile(`${path}/build/index.html`));
};
