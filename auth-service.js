const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
  userName: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  loginHistory: [
    {
      dateTime: { type: Date, default: Date.now },
      userAgent: { type: String },
    },
  ],
});

let User;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://dbJaaved:oV2cI030cPygkUlK@atlascluster.3sbrye5.mongodb.net/Web322N?retryWrites=true&w=majority");

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};


module.exports.registerUser = function (userData) {
  return new Promise(function (resolve, reject) {
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
    } else {
      bcrypt.hash(userData.password, 10)
        .then(hash => {
          const newUser = new User({
            userName: userData.userName,
            password: hash,
            email: userData.email,
            loginHistory: [{ dateTime: new Date(), userAgent: userData.userAgent }],
          });

          newUser.save(function (err) {
            if (err) {
              if (err.code === 11000) {
                reject("User Name already taken");
              } else {
                reject("There was an error creating the user: " + err);
              }
            } else {
              resolve();
            }
          });
        })
        .catch(err => {
          reject("There was an error encrypting the password");
        });
    }
  });
};

module.exports.checkUser = function (userData) {
  return new Promise(function (resolve, reject) {
    User.findOne({ userName: userData.userName })
      .then(user => {
        if (!user) {
          reject(`Unable to find user: ${userData.userName}`);
        } else {
          bcrypt.compare(userData.password, user.password)
            .then(match => {
              if (match) {
                const loginHistoryItem = {
                  dateTime: new Date().toString(),
                  userAgent: userData.userAgent,
                };

                user.loginHistory.push(loginHistoryItem);

                user.updateOne(
                  { userName: user.userName },
                  { $set: { loginHistory: user.loginHistory } },
                  function (err) {
                    if (err) {
                      reject(`There was an error verifying the user: ${err}`);
                    } else {
                      resolve(user);
                    }
                  }
                );
              } else {
                reject(`Incorrect Password for user: ${userData.userName}`);
              }
            })
            .catch(err => {
              reject("Error comparing passwords");
            });
        }
      })
      .catch(err => {
        reject("Error retrieving user from database");
      });
  });
};
