module.exports = function(){
    var crypto = require('crypto');
    var len = 128;

    var iterations = 12000;

   this.md5Hash = function(name){
        return crypto.createHash('md5').update(name).digest("hex");
   }

    this.hash = function(pwd, salt, fn) {
      if (3 == arguments.length) {
        crypto.pbkdf2(pwd, salt, iterations, len, function(err, hash){
          fn(err, hash.toString('base64'));
        });
      } else {
        fn = salt;
        crypto.randomBytes(len, function(err, salt){
          if (err) return fn(err);
          salt = salt.toString('base64');
          crypto.pbkdf2(pwd, salt, iterations, len, function(err, hash){
            if (err) return fn(err);
            fn(null, salt, hash.toString('base64'));
          });
        });
      }
    }
}