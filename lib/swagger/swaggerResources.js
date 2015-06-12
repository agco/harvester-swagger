var express = require('express');
var path = require('path');

var swaggerResources = function(app, config) {
  app.use('/', express.static(process.cwd() + config.swaggerUiPath));

  app.get('/api-docs.json', function (req, res, next) {
    var models = require(path.join(process.cwd(), config.writePath) + 'index.json');
    models.basePath = config.host;
    res.status(200).json(models);
  });

  app.get('/api-docs.json/:resource', function (req, res, next) {
    var models = require(path.join(process.cwd(), config.writePath) + req.params.resource + '.json');
    models.basePath = config.host;
    res.status(200).json(models);
  });

  app.get(/^\/swagger(\/.*)?$/, function (req, res, next) {
    var model = {
      title: config.title,
      applicationUrl: config.host + '/api-docs.json'
    };

    res.render(process.cwd() + config.swaggerUiPath + 'index', model);
  });
};

module.exports = swaggerResources;