//I rely on these to be set. set them at the very beginning here for now.
//maybe use dotenv to keep track of these locally
process.env.APP_PASSWORD = 1234;
process.env.NODE_ENV = 'development';
process.env.DEBUG = 'app:startup';

const startupDebugger = require('debug')('app:startup');//app:startup is the value of the env variable DEBUG.
const dbDebugger = require('debug')('app:db');

const config = require('config'); //the config module for handling different dev environments.
const Joi = require("joi");
const logger = require("./logger");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
let app = express();


console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
//get the env using app
console.log(`app: ${app.get("env")}`);

//configuration
//the properties we are getting come from the file in the config folder based on the env variable. ie: if development it will read from development.json
console.log(`Application Name: ${config.get('name')}`);//use config.get() to get the value of a property by name. these properties come from the config folder
console.log(`Mail Server: ${config.get('mail.host')}`);//use config.get() to get the value of a property by name. these properties come from the config folder

console.log(`Mail Server Password: ${config.get('mail.password')}`);//use config.get() to get the value of a property by name. these properties come from the config folder

//**MIDDLEWARE**//
//parse body of request
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //URL encoded payload ie: key=value&key=value (allows key value pairs to be sent in the body)
app.use(express.static("public")); //all static files will be served from the public folder
app.use(helmet());

if (app.get("env") === "development") {
  //morgan loggs all http requests to the console by default
  app.use(morgan("tiny"));
  startupDebugger("Morgan enabled...");
}

//example of using dbDebugger for dbwork
dbDebugger('connected to the database...');

//custom midleware example from logger.js
app.use(logger);

//Genres API. Assuming we will move this later//

const genres = [
  { id: 1, name: "Horror" },
  { id: 2, name: "Comedy" },
  { id: 3, name: "SciFi" },
  { id: 4, name: "Romance" },
  { id: 5, name: "Documentary" }
];

//get all genres
app.get("/api/genres", (req, res) => {
  res.send(genres);
});

//get genre by id
app.get("/api/genres/:id", (req, res) => {
  const genre = genres.find(g => g.id === parseInt(req.params.id));

  if (!genre) {
    //404
    return res
      .status(404)
      .send(`The Genre with the id of ${req.params.id} was not found!`);
  }
  res.send(genre);
});

app.post("/api/genres", (req, res) => {
  const schema = {
    name: Joi.string()
      .min(3)
      .required()
  };

  //validate
  const { error } = validateGenre(req.body);
  //if!valid return 400

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const genre = {
    id: genres.length + 1,
    name: req.body.name
  };

  genres.push(genre);

  res.send(genre);
});

app.put("/api/genres/:id", (req, res) => {
  //lookup genre
  const genre = genres.find(g => g.id === parseInt(req.params.id));
  //if!genre return 404
  if (!genre) {
    //404
    return res
      .status(404)
      .send(`The Genre with the id of ${req.params.id} was not found!`);
  }
  //validate
  const { error } = validateGenre(req.body);
  //if!valid return 400

  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  //update genre

  genre.name = req.body.name;
  //return updated genre
  res.send(genre);
});

app.delete("/api/genres/:id", (req, res) => {
  const genre = genres.find(g => g.id === parseInt(req.params.id));
  //if!genre return 404
  if (!genre) {
    //404
    return res
      .status(404)
      .send(`The Genre with the id of ${req.params.id} was not found!`);
  }
  //delete
  const index = genres.indexOf(genre);
  genres.splice(index, 1);

  //return res
  res.send(genre);
});

function validateGenre(genre) {
  const schema = {
    name: Joi.string()
      .min(3)
      .required()
  };

  return Joi.validate(genre, schema);
}

//End apis//

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port: ${port}...`);
});
