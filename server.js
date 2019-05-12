const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const shortid = require('shortid');
try{
  mongoose.connect(process.env.MONGODBATLAS_URI,{useNewUrlParser: true , 
                                                 useCreateIndex: true, 
                                                 useFindAndModify: false} )
}catch (error) {
  console.error(error);
}

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'));


let Schema = mongoose.Schema;

// Parent schema for users
let userSchema = new Schema({username: {type: String, required: true, maxlength: [20, 'username too long']},
                               _id: {type: String, required: true},
                               tracker: {type: Array, required: true, default: []}});
let User = mongoose.model('User', userSchema);

// Child schema for exercises
let exerciseSchema = new Schema({description: {type: String, required: true, maxlength: [20, 'description too long'], minlength: [1, 'description too short'], default: undefined},
                                duration: {type: Number, required: true, default: undefined, min: [1, 'duration too short']},
                                date: {type: Date, required: true, default: Date.now},
                                 _id: {type: String, required: true}});
let Exercise = mongoose.model('Exercise', exerciseSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// posts new user to db
app.post("/api/exercise/new-user", (req, res, next) => {
  const username = req.body.username;
  findUser(username)
    .then(user => {
      if(user === null){
        newUser(username)
          .then(newUser => res.json(newUser))
          .catch(next);
      }else{
        console.log(user);
        next({
          status: 400,
          message: "User '" + username + "' already exists."
        })
      }
    })
    .catch(next);
});

// posts exercise to user
app.post("/api/exercise/add", (req, res, next) => {
  let _id = req.body.userId;
  let newExercise;
  makeExercise(req.body.description, req.body.duration, req.body.date)
    .then(exercise => {
      newExercise = exercise;
      return addExercise(_id, exercise)
    })
    .then(user => res.send(newExercise))
    .catch(next);
});

app.get("/api/exercise/log", (req, res) => {
  const{userId, from, to, limit} = req.query;
  console.log('from: ' + from + ' to: ' + to + ' limit: ' + limit);
  findId(userId)
    .then(user => {
      if(user === null) {
        res.send("user '" + userId + "' not found");
      }else{
        let log = [...user.tracker];
        if(from) {log = log.filter(exercise => exercise.date > new Date(from))};
        if(to) {log = log.filter(exercise => exercise.date < new Date(to))};
        if(limit) {log = log.slice(0, limit)};
        log.forEach(exercise => exercise.date = formatDate(exercise.date));
        res.json(log);                 
      }
    })
    .catch(err => console.error(err));
});

//Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
});

// Error Handling middleware
app.use((err, req, res, next) => {
  console.log('ok');
  let errCode, errMessage;
  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});

// Finds user by username
const findUser = (username) => {
  return User.findOne({username: username});
}
    
// Creates a new user
const newUser = (username) => {
  return User.create({username: username, _id: shortid.generate(), tracker: []});
}

// Finds user by id
const findId = (_id) => {
  return User.findById({_id});
}

// Creates and saves exercise to validate
const makeExercise = (description, duration, date) => {
  let exercise = new Exercise({description: description, 
                               duration: duration,
                               date: new Date(date),
                               _id: shortid.generate()});
  return exercise.save();
}

// Creates new exercise log
const addExercise = (_id, exercise) => {
  return User.findOneAndUpdate({_id: _id}, {$push: {tracker: exercise}}, {new: true});
}

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}