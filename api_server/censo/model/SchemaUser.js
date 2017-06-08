/**
 * Created by VictorMiranda on 03/02/2017.
 *
 * This file is a model of our User
 * It is using a ECMAScript 6, The future standard for Javascript
 */

const mongoose = require('mongoose');
const schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
//const crypto = require('crypto');

const UserSchema =  new schema({
    username: { type: String, unique: true },
    displayName:  String,
    email: { type: String, unique: true, lowercase: true },
    password: { type: String, select: true },
    signUpdate: { type: Date, default: Date.now() },
    lastlogin: Date,
    // Fecha en la que se le firmó su identidad anónima
    identityGivenDate: Date,
    anonim_id: String
});

UserSchema.pre('save', function (next){
    let user = this;
    if(!user.isModified('password')) return next();

    bcrypt.genSalt(10, function (err,salt){
        if (err) return next;
        bcrypt.hash(user.password, salt, null, function(err, hash){
            if (err) return (err);
            user.password = hash;
            next();
        })
    })
});


module.exports = mongoose.model('User', UserSchema);
