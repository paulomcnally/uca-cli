var fs = require('fs');
var Message = require('./message');
var Auth = require('./auth');
var message = new Message();
var auth = new Auth();

var Cache = function() {

};

Cache.prototype.check = function() {
  var exists = fs.existsSync(auth.getFilePath());
  if (!exists){
    message.error('✗ Authentication required!');
    message.info('Autenticate: gnpm login');
    message.info('or');
    message.info('Create account: gnpm new');
    process.exit(0);
  }
};

Cache.prototype.get = function(key) {
  var data = fs.readFileSync(auth.getFilePath(), 'utf8');
  var parts = data.split('|');
  var obj = {
    accessToken: parts[0],
    userId: parts[1]
  };
  return obj[key];
};

module.exports = Cache;
