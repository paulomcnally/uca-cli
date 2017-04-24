var request = require('request');
var deasync = require('deasync');
var qs = require('querystring');

var postSync = deasync(request.post);
var putSync = deasync(request.put);
var getSync = deasync(request.get);
var deleteSync = deasync(request.del);

module.exports = function Api() {

  var apiUrl = 'https://uca-quiz-api.herokuapp.com/api/';

  var contentType = 'application/json; charset=utf-8';

  return {
    post: function(resource, params, accessToken) {
      var options = {
        url: apiUrl + resource
      };
      if (params) {
        options.form = params;
      }
      if (accessToken) {
        options.headers = {
          authorization: accessToken
        };
      }
      var response = postSync(options);
      if (response.headers['content-type'] === contentType) {
        return JSON.parse(response.body);
      }
      else {
        return response.body;
      }
    },
    put: function(resource, params, accessToken) {
      var options = {
        url: apiUrl + resource
      };
      if (params) {
        options.form = params;
      }
      if (accessToken) {
        options.headers = {
          authorization: accessToken
        };
      }
      var response = putSync(options);
      if (response.headers['content-type'] === contentType) {
        return JSON.parse(response.body);
      }
      else {
        return response.body;
      }
    },
    get: function(resource, query, accessToken, rootProperty) {
      if (rootProperty) {
        resource = resource + '?' + rootProperty + "=" + JSON.stringify(query);
      } else if (query) {
        resource = resource + '?' + qs.stringify(query);
      }

      var options = {
        url: apiUrl + resource
      };

      if (accessToken) {
        options.headers = {
          authorization: accessToken
        };
      }
      var response = getSync(options);
      if (response.headers['content-type'] === contentType) {
        return JSON.parse(response.body);
      }
      else {
        return response.body;
      }
    },
    del: function(resource, accessToken) {
      var options = {
        url: apiUrl + resource
      };
      if (accessToken) {
        options.headers = {
          authorization: accessToken
        };
      }
      var response = deleteSync(options);
      if (response.headers['content-type'] === contentType) {
        return JSON.parse(response.body);
      }
      else {
        return response.body;
      }
    }
  };
};
