var util = require('util'),
    qs = require('querystring'),
    Request = require('request');

/* Login Process */
/*

reference:
- http://developer.baidu.com/wiki/index.php?title=docs/oauth/authorization
- http://developer.baidu.com/wiki/index.php?title=docs/oauth/refresh

http://demoapi.duapp.com/wiki/index.php

http://openapi.baidu.com/oauth/2.0/authorize?
  response_type=code&
  client_id=f8eye1pkxgFFqIN5yqTedZ5n&
  redirect_uri=http%3A%2F%2Fdemoapi.duapp.com%2Fwiki%2Flogin_callback.php&
  scope=basic%2Cnetdisk%2Cpcs_doc%2Cpcs_album%2Cpcs_music%2Cpcs_video&
  display=page
*/

var ClientId = 'f8eye1pkxgFFqIN5yqTedZ5n';

var passportUrl = 'https://passport.baidu.com/v2/api/?' +
  'getapi&class=login&tpl=mn&tangram=false';
var loginUrl = 'https://passport.baidu.com/v2/api/?login';

var oauthUrl = 'http://openapi.baidu.com/oauth/2.0/authorize?' +
  'response_type=code&' +
  'client_id=' + ClientId + '&' +
  'redirect_uri=http%3A%2F%2Fdemoapi.duapp.com%2Fwiki%2Flogin_callback.php&' +
  'scope=basic%2Cnetdisk%2Cpcs_doc%2Cpcs_album%2Cpcs_music%2Cpcs_video&' +
  'display=page';

var Service = {
  quota: {
    url: 'https://pcs.baidu.com/rest/2.0/pcs/quota?method=info&access_token=%s'
  }
};

var jar = Request.jar();

var defaultRequestOptions = {
  headers: { 'User-Agent': 'Opera/9.23', 'Accept-Language': 'zh-cn' },
  jar: jar
};
var request = Request.defaults(defaultRequestOptions);

function extractFrom(content, regExp) {
  var result;
  var matches = content.match(regExp);
  if (matches) {
    result = matches[1];
  }
  return result;
}

function responseCallback(logPrefix, cb) {
  return function(err, resp, body) {
    if (err) {
      throw new Error(err);
    }
    else {
      if (logPrefix) {
        console.log('%s headers ======> ', logPrefix);
        console.log(resp.headers);
        console.log('%s response ======> ', logPrefix);
        console.log(body);
      }
      if (cb && typeof(cb) === 'function') {
        cb(err, resp, body);
      }
    }
  };
}

function Baidu() {
  this.loginRequired = true;
  this.session = {};
}

Baidu.prototype.quota = function(callback) {
  var quotaUrl = util.format(Service.quota.url, this.session.accessToken);
  request(quotaUrl, responseCallback(false, function(err, resp, body) {
    callback(null, JSON.parse(body));
  }));
};

Baidu.prototype.login = function login(username, password, callback) {
  var self = this;

  function passOauth() {
    request(oauthUrl, responseCallback('oauth', function() {
        var cookies = jar.cookies;
        var cookieName = 'bds_' + ClientId + '_session';
        cookies.forEach(function(cookie) {
          if (cookieName === cookie.name) {
            var session = qs.parse(decodeURIComponent(cookie.value));
            self.session.accessToken = session['access_token'];
          }
        });
        if (self.session.hasOwnProperty('accessToken')) {
          self.loginRequired = false;
        }
        else {
          self.loginRequired = true;
        }
        callback();
      }));
  }

  request('https://passport.baidu.com/v2/api/?login&tpl=mn', function() {
    request(passportUrl,
      responseCallback('passport', function(err, resp, body) {
        var tokenRegEx = /bdPass.api.params.login_token=["'](.+)["'];$/m;
        var tplRegEx = /bdPass.api.params.login_tpl=["'](.+)["'];$/m;
        var token = extractFrom(body, tokenRegEx);
        var tpl = extractFrom(body, tplRegEx);
        var params = {
          staticpage: 'http://www.baidu.com/cache/user/html/jump.html',
          charset: 'UTF-8',
          token: token,
          tpl: tpl,
          codeString: '',
          isPhone: 'false',
          safeflg: 0,
          index: 0,
          u: 'http://www.baidu.com',
          username: username,
          password: password,
          loginType: 1,
          verifycode: '',
          'mem_pass': 0,
          'ppui_logintime': '',
          callback: 'parent.bdPass.api.login._postCallback',
        };

        var options = { url: loginUrl, form: params };
        request.post(options, responseCallback('login', function() {
          passOauth();
        }));
      }));
  });
};

var instance = new Baidu();

module.exports = instance;