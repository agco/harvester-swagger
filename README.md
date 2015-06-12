# harvester-swagger

This module is a Swagger work in progress.  The basic idea is to create the json files swagger uses and to serve these with express routes.

This module includes `swaggerui` source at `example/swaggerui`, this can be replaced.

## Generate swagger files

```
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


var routes = [
  { route : 'user', method : 'GET',    path: '/user/:id', validation : validation.user.get },
  { route : 'user', method : 'POST',   path: '/user', validation : validation.user.post },
  { route : 'user', method : 'DELETE', path: '/user/:id', validation : validation.user.del },
  { route : 'user', method : 'PUT',    path: '/user/:id', validation : validation.user.put }
];

swagger.generate(routes, '/example/swagger/', '0.1.5');
```

## Serve swagger

```
swagger.resources(app, {
  title : 'AGCO Global API',
  swaggerUiPath : '/example/swaggerui/',
  writePath : '/example/swagger/',
  host : 'http://127.0.0.1:3000'
});

```


## Examples

```
node example/app.js
```
Then visit:

http://127.0.0.1:3000/swagger


## Todo

This implementation is lacking the following:

- No `Response Class` support, you could use the models schema or like hapi have a different response schema
- When post/put we support arrays one level deep, this could be improved
- Currently all parameters are `required`, use `joi.isRequired` to improve this
- Currently `Error Status Codes` are passed in at the route level, this could be defaulted


