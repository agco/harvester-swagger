var path = require('path');
var url = require('url');
var jsonFile = require('json-file-plus');
var _ = require('lodash');
var indexfile = require('./createIndexFile');

var capitalise = function(string){
    if (!string) return string;
    string = string.replace('/', '');
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

var childItems = function(validationItem) {
  var childSchema = {};

  validationItem._inner.inclusions.forEach(function(item) {
    item._inner.children.forEach(function(child) {
      childSchema[child.key] = { type : capitalise(child.schema._type) };
    });
  })

  return childSchema;
}

var createParameter = function(validation, parameterType) {
  var keys = Object.keys(validation);
  var parameters = [];

  for (var key in keys) {
    var validationKey = keys[key];
    var validationItem = validation[validationKey];

    if (validationItem._type === "boolean") {
      validationItem._type = "Bool";
    }

    var parameter = {
      name: validationKey,
      description: 'A ' + validationKey,
      paramType: parameterType,
      required: true,
      dataType: capitalise(validationItem._type)
    };

    parameters.push(parameter);
  }

  return parameters;
};

var createBodyParameterWithModel = function(validation, name, method){
  var keys = Object.keys(validation);
  var parameters = [];
  var items = {};
  var models = {};
  var modelSchema = {};

  for (var key in keys) {
    var validationKey = keys[key];
    var validationItem = validation[validationKey];

    if (validationItem._type === "boolean") {
      validationItem._type = "Bool";
    }

    if (validationItem._type === 'array') {
        modelSchema[validationKey] = { type : capitalise(validationItem._type), items : { '$ref':  capitalise(name) + capitalise(method) + 'Item' }  };
        items[validationKey] = modelSchema[validationKey];

        models[capitalise(name) + capitalise(method) + 'Item'] = { properties : childItems(validationItem) };
    } else {
      modelSchema[validationKey] = { type : capitalise(validationItem._type) };
      items[validationKey] = modelSchema[validationKey];
    }
  }

  if (items) {
    models[capitalise(name) + capitalise(method)] = { properties : items };
  }
  
  var parameter = {
    name: 'body',
    description: 'A ' + capitalise(name),
    paramType: "body",
    required: true,
    dataType: capitalise(name) + capitalise(method)
  };

  parameters.push(parameter);

  return { parameters: parameters, models: models };
}

var createParametersAndModels = function(validation, name, method){
  if (!validation) {
    return [];
  }

  var parameters = [];
  var models = {};

  if (validation.params) {
    var item = createParameter(validation.params, "path");
    parameters = parameters.concat(item);
  }

  if (validation.headers) {
    var item = createParameter(validation.headers, "header");
    parameters = parameters.concat(item);
  }

  if (validation.query) {
    var item = createParameter(validation.query, "query");
    parameters = parameters.concat(item);
  }

  if (validation.body) {
    var item = createBodyParameterWithModel(validation.body, name, method);
    parameters = parameters.concat(item.parameters);
    models = item.models;
  }

  return { parameters : parameters, models : models};
};

var createApi = function(path, route, response) {
  return {
      path: path,
      operations: [{
        httpMethod: route.method.toUpperCase(),
        summary: route.options && route.options.description ? route.options.description : capitalise(route.method) + " a "  + route.route,
        nickname: capitalise(route.route),
        consumes: route.options && route.options.consumes ? route.options.consumes : [ "application/json" ],
        produces: route.options && route.options.produces ? route.options.produces : [ "application/json" ],
        parameters : response.parameters,
        responseMessages: route.options && route.options.responseMessages ? route.options.responseMessages : []
      }]
    };
}

var createApis = function(model){
  var apis = [];
  var models = {};

  model.forEach(function(route){
    var response = createParametersAndModels(route.validation, route.path, route.method);
    var path = route.path;

    models = _.extend(models, response.models);
    
    if (route.path.indexOf(':') !== -1) {
      path = route.path.replace(':','{') + '}';
    }

    var api = createApi(path, route, response);
    apis.push(api);
  });

  return { apis : apis, models : models};
};

var createApiFiles = function(routing, writePath, version){
  
  var routes = _.uniq(_.pluck(routing, 'route'));

  routes.forEach(function(route) {
    var routeForPage = _.filter(routing, function(item) { 
      return item.route == route; 
    });

    var response = createApis(routeForPage);
    var template = path.join(__dirname, '/templates/api.json');
    var version = version ? version : '0.0.1' ;

    jsonFile(template, function (err, file) {
      if (err) {
        throw new Error('Unable to find template');
      }

      file.set({ apiVersion: version }); 
      file.set({ swaggerVersion: '1.2.5' }); 
      file.set({ apis:  response.apis }); 
      file.set({ models: response.models }); 
      file.filename = path.join(process.cwd(), writePath + route + '.json');
      file.save();
    });
  });
};

module.exports = createApiFiles;