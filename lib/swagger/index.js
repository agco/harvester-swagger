var _ = require('lodash');
var swaggerResources = require('./swaggerResources');
var createApifiles = require('./createApiFiles');
var createIndexfile = require('./createIndexFile');

exports.generate = function(routes, writePath, version) {
  if (!writePath) throw new Error('Please sepecify where you would like to store your swagger resources');
  if (!version) throw new Error('Please provide a version number');
  if (!routes) throw new Error('Please provide a list of routes to swagger enable');

  routes.forEach(function(route) {
    if (!route.route) throw new Error('Please provide a route name', route);
    if (!route.method) throw new Error('Please provide a method for route', route);
    if (!route.path) throw new Error('Please provide a path for route', route);
  });

  createIndexfile(routes, writePath, version);
  createApifiles(routes, writePath, version);
}

exports.resources = function(app, config) {
  if (!config.title) throw new Error('Please provide a title');
  if (!config.swaggerUiPath) throw new Error('Please specify the location of the swagger ui');
  if (!config.writePath) throw new Error('Please sepecify where you stored your swagger resources');
  if (!config.host) throw new Error('Please specify the url which hosts your swagger resources');

  swaggerResources(app, config);
}
