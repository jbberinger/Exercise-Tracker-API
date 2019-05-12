Built with: Node, Express, Mongoose, MongoDB, HTML5, CSS, Javascript
Live Glitch App: [Live Glitch App](https://sly-appendix.glitch.me)

This exercise tracker microservice utilizes multiple web frameworks with REST API and the MongoDB Atlas platform. Users can create profiles and input exercise information using the provided forms, which POST to the MongoDB Atlas database. Additionally, users can access their exercise logs using GET requests/querystrings directly in the browser or with a program such as Postman.

--------

# Exercise Tracker REST API

#### A microservice project, part of Free Code Camp's curriculum

### User Stories

1. I can create a user by posting form data username to /api/exercise/new-user and returned will be an object with username and _id.
2. I can get an array of all users by getting api/exercise/users with the same info as when creating a user.
3. I can add an exercise to any user by posting form data userId(_id), description, duration, and optionally date to /api/exercise/add. If no date supplied it will use current date. Returned will the the user object with also with the exercise fields added.
4. I can retrieve a full exercise log of any user by getting /api/exercise/log with a parameter of userId(_id). Return will be the user object with added array log and count (total exercise count).
5. I can retrieve part of the log of any user by also passing along optional parameters of from & to or limit. (Date format yyyy-mm-dd, limit = int)
