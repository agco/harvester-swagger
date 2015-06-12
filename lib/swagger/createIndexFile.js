var path = require('path');
var _ = require('lodash');
var jsonFile = require('json-file-plus');

var indexfile = function(routing, writePath, version) {
  var routes = _.uniq(_.pluck(routing, 'route'));
  var template = path.join(__dirname, '/templates/index.json');
  var apis = [];

  routes.forEach(function(route){
    apis.push({
      path: "/api-docs.json/" + route
    });
  });

  jsonFile(template, function (err, file) {
    if (err) throw new Error('Unable to find index file')
    file.set({ apiVersion: version || '0.0.1' }); 
    file.set({ swaggerVersion: '1.2.5' }); 
    file.set({ apis: apis }); 
    file.filename = path.join(process.cwd(), writePath + '/index.json');
    file.save();
  });
};

module.exports = indexfile;