/**
 * Created by Ruslan on 11/6/2017.
 */
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const PassportLocalStrategy = require('passport-local').Strategy;
const config = require("../../config");
const helpers = require("./helpers");

/**
 * Return the Passport Local Strategy object.
 */
function loginMiddleware (sql) {

    return new PassportLocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        session: false,
        passReqToCallback: true
    }, (req, email, password, done) => {
        const userData = {
            email: email.trim(),
            password: password.trim(),
        };

        sql.getUser(userData.email).then((user) => {
            if (user === undefined) {
                console.log("Wrong email");

                const error = new Error('Incorrect email or password');
                error.name = 'IncorrectCredentialsError';

                return done(error);
            } else {
                return helpers.comparePassword(userData.password, user.password).then((isMatch) => {
                    if (!isMatch) {
                        console.log("Wrong password");

                        const error = new Error('Incorrect email or password');
                        error.name = 'IncorrectCredentialsError';

                        return done(error);
                    }

                    const payload = {
                        sub: user.id
                    };

                    // create a token string
                    const token = jwt.sign(payload, config.jwtSecret);
                    const data = {
                        name: user.username
                    };

                    return done(null, token, data);
                });
            }

        }).catch((err) => {
            return done(err);
        });
    });
}

module.exports = (db) => {
    return loginMiddleware(db);
};