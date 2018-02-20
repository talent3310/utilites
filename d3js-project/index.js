var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var request = require('request');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static(__dirname + '/app'));
app.listen(process.env.PORT || 3000, function() {
  console.log('server started at 3000 port');
});

var api_key = 'key-d036f75540c964f03636ce9026778aac';
var domain = 'sandboxa44465646c6640f494ce29dc70f69514.mailgun.org';
var mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/app/index.html');

  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  var data = {
    from: 'Chat Form feeeup.bzaya@gmail.com',
    to: 'tsogtbayar0821@hotmail.com',
    subject: 'Chat Form',
    html: 'Someone saw your website from ' + ip
  };

  var url = 'https://www.freegeoip.net/json/' + ip;
  request(url, function(error, response, body) {

    if (error) {
      mailgun.messages().send(data, function(error, body) {
        console.log(body);
      });
    } else {
      body = JSON.parse(body);
      data.html = '<b>country</b>: ' + body.country_name + '<br><b>city</b>: ' + body.city + '<br><b>ip</b>: ' + body.ip + '<br><b>time</b>: ' + new Date().toLocaleString('en-US', { timeZone: 'Asia/Ulan_Bator' }) + '<br><br>Someone saw your website. <a href="https://tsogt.herokuapp.com/tsogt">https://tsogt.herokuapp.com/tsogt</a>';
      mailgun.messages().send(data, function(error, body) {
        console.log(body);
      });
    }
  });
});