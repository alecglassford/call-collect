(function () {
'use strict';

/* eslint-env browser */

var deployFilesBase = 'https://raw.githubusercontent.com/alecglassford/cc2/master/';

var getDeployFiles = function getDeployFilesFunc() {
  return fetch('deploy-files.json')
    .then(function (res) { return res.json(); })
    .then(function (filenames) {
      var files = filenames.map(function (file) { return fetch(("" + deployFilesBase + file))
          .then(function (res) { return res.text(); })
          .then(function (data) { return ({ file: file, data: data }); }); });
      return Promise.all(files);
    });
};

var deploy = function deployFunc(env) {
  getDeployFiles()
    .then(function (files) {
      var postBody = {
        env: env,
        public: true,
        forceNew: true,
        name: document.getElementById('subdomain').value,
        deploymentType: 'NPM',
        files: files,
      };
      console.log(postBody);
      var nowToken = document.getElementById('now-token').value;
      console.log(nowToken);
      return fetch('https://api.zeit.co/v3/now/deployments', {
        method: 'POST',
        headers: {
          Authorization: ("Bearer " + nowToken),
          'content-type': 'application/json',
        },
        body: JSON.stringify(postBody),
        mode: 'cors',
      });
    })
    .then(function (nowRes) { return nowRes.json(); }).then(function (success) {
      console.log('success?');
      console.log(success);
    })
    .catch(function (err) {
      console.error(err);
    });
};

var setEnv = function setEnvFunc() {
  var env = {
    AIRTABLE_KEY: document.getElementById('airtable-key').value,
    AIRTABLE_BASE: document.getElementById('airtable-base').value,
    TWILIO_ACCOUNT_SID: document.getElementById('twilio-account-sid').value,
    TWILIO_AUTH_TOKEN: document.getElementById('twilio-auth-token').value,
    PASSPHRASE: document.getElementById('passphrase').value,
  };

  var gooogleCredsFile = document.getElementById('google-creds').files[0];
  var reader = new FileReader();
  reader.onload = function doneReadingGoogleCreds() {
    env.GOOGLE_CREDS_STRING = reader.result;
    deploy(env);
  };
  reader.readAsText(gooogleCredsFile);
};

document.getElementById('deploy').addEventListener('click', setEnv);

}());