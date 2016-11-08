var LocalStrategy    = require('passport-local').Strategy;
var configDB = require('./database.js');
var Sequelize = require('sequelize');
var pg = require('pg');
var sequelize = new Sequelize(configDB.url);
var User       = sequelize.import('../app/models/user');
User.sync();
module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id).then(function(user){
			done(null, user);
		}).catch(function(e){
			done(e, false);
		});
    });


    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {
			User.findOne({ where: { localemail: email }})
				.then(function(user) {
					if (!user) {
						done(null, false, req.flash('loginMessage', 'Unknown user'));
					} else if (!user.validPassword(password)) {
						done(null, false, req.flash('loginMessage', 'Wrong password'));
					} else {
						done(null, user);
					}
				})
				.catch(function(e) {
					done(null, false, req.flash('loginMessage',e.name + " " + e.message));
				});
	}));


    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {


		User.findOne({ where: { localemail: email }})
			.then(function(a) {

				if (a)
					return done(null, false, req.flash('loginMessage', 'That email is already taken.'));

				if(req.user) {
					var user            = req.user;
					user.localemail    = email;
					user.localpassword = User.generateHash(password);
					user.save().catch(function (err) {
						throw err;
					}).then (function() {
						done(null, user);
					});
				}
				else {
					// create the user
           //tao ma hash
					var newUser = User.build ({localemail: email, localpassword: User.generateHash(password)});
					newUser.save().then(function() {done (null, newUser);}).catch(function(err) { done(null, false, req.flash('loginMessage', err));});
				}
			})
			.catch(function (e) {
				done(null, false, req.flash('loginMessage',e.name + " " + e.message));
			})

    }));

};
