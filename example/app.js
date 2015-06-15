var http = require('http');
var express = require('express');
var cons = require('consolidate');
var validate = require('express-validation');
var Joi = require('joi');
var bodyParser = require('body-parser');
var swagger = require('../lib/swagger');
var app = express();

app.engine('html', cons.handlebars);
app.set('view engine', 'html');
app.set('views', 'public');
app.use(bodyParser.json());

//validation
var validation = { 
  user : { 
    get : { 
      params: { id : Joi.string() },
      query: { profile : Joi.boolean() },
      headers: { token : Joi.number() }
    },
    post : { 
      headers: { token : Joi.number() },
      body: { cats: Joi.array().includes({ 
        username : Joi.string().required(),
        name : Joi.string().required()
      })}
    },
    del : { 
      params: { id : Joi.string() },
      headers: { token : Joi.number() }
    },
    put : { 
      params: { id : Joi.string() },
      headers: { token : Joi.number() },
      body: { cats: Joi.array().includes({ 
        username : Joi.string().required(),
        name : Joi.string().required()
      })}
    }
  }
};

//routes
app.get('/user/:id', validate(validation.user.get),  function(req, res) { 
  res.status(200).json({ id: req.params.id, token: req.headers.token, profile: req.query.profile }) 
});

app.post('/user', validate(validation.user.post),  function(req, res) { 
  res.status(201).json({ token: req.headers.token, body: req.body }) 
});

app.delete('/user/:id', validate(validation.user.del), function (req, res) {
  res.status(204).json('ok')
});

app.put('/user/:id', validate(validation.user.put), function (req, res) {
  res.status(204).json('ok')
});

//swagger response codes
var messages = [
  { code: 500, message: "Internal server error" },
  { code: 400, message: "Bad request" },
  { code: 404, message: "Not found" }
];

//swagger route override options
var routeOptions = {
  responseMessages : messages,
  description : 'get a user by user id',
  consumes : ["application/json"],
  produces : ["application/json"]
};

//swagger routes
var routes = [
  { route : 'user', method : 'GET',    path: '/user/:id', validation : validation.user.get, options : routeOptions },
  { route : 'user', method : 'POST',   path: '/user', validation : validation.user.post },
  { route : 'user', method : 'DELETE', path: '/user/:id', validation : validation.user.del },
  { route : 'user', method : 'PUT',    path: '/user/:id', validation : validation.user.put }
];

//create swagger json files
swagger.generate(routes, '/example/swagger/', '0.1.5');

//serve json swagger files
swagger.resources(app, {
  title : 'AGCO Global API',
  swaggerUiPath : '/example/swaggerui/',
  writePath : '/example/swagger/',
  host : 'http://127.0.0.1:3000'
});

http.createServer(app).listen(3000);
module.exports = app;