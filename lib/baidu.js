var util = require('util'),
    qs = require('querystring'),
    Request = require('request');

var baohe = require('../'),
    debug = baohe.debug;

var ServiceName = 'baidu';
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
  },
  list: {
    url: 'https://pcs.baidu.com/rest/2.0/pcs/file?method=list&' +
      'access_token=%s&path=%s'
  },
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
        debug('%s status code: %s', logPrefix, resp.statusCode);
        debug('%s headers\n%s ', logPrefix, util.inspect(resp.headers));
        debug('%s response\n%s ', logPrefix, body);
      }
      if (cb && typeof(cb) === 'function') {
        cb(body, resp);
      }
    }
  };
}

function Baidu() {
  this.loginRequired = true;
  var config = baohe.getConfig(ServiceName);
  if (!config.session) {
    config.session = {};
  }
  this.session = config.session;
}

Baidu.prototype.init = function(callback) {
  var self = this;

  function processLogin() {
    baohe.promptLoginInfo(function(user, password) {
      self.login(user, password, function() {
        if (self.loginRequired) {
          processLogin();
        } else {
          debug('Login sucessfully');
          process.nextTick(callback);
        }
      });
    });
  }

  if (this.session.accessToken) {
    //TODO store quota result to this.service.quota
    this.quota(function(result, resp) {
      if (resp.statusCode === 200 && !result['error_code']) {
        self.loginRequired = false;
      }

      if (self.loginRequired) {
        processLogin();
      } else {
        process.nextTick(callback);
      }
    });
  }
  else {
    processLogin();
  }
};

Baidu.prototype.quota = function(callback) {
  var quotaUrl = util.format(Service.quota.url,
    this.session.accessToken);
  request(quotaUrl, responseCallback('quota', function(body, resp) {
    callback(JSON.parse(body), resp);
  }));
};

Baidu.prototype.list = function(callback) {

  var AppRoot = '/apps/测试应用';
  var listUrl = util.format(Service.list.url,
    this.session.accessToken,
    encodeURIComponent(AppRoot + '/'));

  request(listUrl, responseCallback('list', function(body) {
    callback(JSON.parse(body).list);
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
        if (self.session.accessToken) {
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
      responseCallback('passport', function(body, resp) {
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
