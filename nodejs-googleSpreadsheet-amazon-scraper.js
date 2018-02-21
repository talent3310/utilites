var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var cron = require('node-cron');
var tr = require('tor-request');
tr.TorControlPort.password = 'wefwefrwefwefwefwefweaffe';

var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('./client_secret.json');
var doc = new GoogleSpreadsheet('1S5bF3eP84Ecwapsdfsdfsdfs82DxFGiMuDVlZ4MA'); //1S5bF3eP8sdfsdf4EcwapH6r3LlULMMbrH8

var api_key = 'key-d03wefwefdsfdsfds4f03636ce9026778aac';
var domain = 'sandboxa44465646c664sdfdsfsvvvewveveve.mailgun.org';
var mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });

var sheetArr = [];
var countAll = 0;
var detailPageNotFoundArr = [];
var gonePageArr = [];
var noBuyBoxArr = [];
var searchUrlPrefix = "http://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Dtools&field-keywords=";
var urlPrefix = "http://www.amazon.com/dp/";


// Authenticate with the Google Spreadsheets API.
var recursiveAmazonScraper = function(sheetArr, callback) {
  var errors = [];
  async.eachLimit(sheetArr, 1, function(item, next) {
    console.log("item=====>", item);
    var searchUrl = searchUrlPrefix + item;
    request(searchUrl, function(err, resp, html) {
      if (err) {
        console.log("Err_amazon_getting_searchUrl!");
        errors.push(item);
        next();
      } else {
        const $ = cheerio.load(html);
        var robotCheck = $("head title").text();
        
        if (robotCheck == 'Robot Check') { // robot check
          console.log("robotCheck=====>", robotCheck);
          errors.push(item);
          next();
          // tr.newTorSession(function(torerr) {
          //   if (torerr) console.log("Err_inner_tor_newTorSession: ", torerr);
          //   else console.log("Ip address was changed to avoid the errors!");
          //   setTimeout(function() { next(); }, 15000);
          // });
        } else {
          var targetClass = $("#search-main-wrapper #main #searchTemplate #topDynamicContent #s-result-info-bar #s-result-info-bar-content").attr('class');
          console.log("targetClass====>", targetClass);

          if (targetClass === 'a-row') { // correct page
            var url = urlPrefix + item;
            request(url, function(err, resp, html) {
              if (err) {
                console.log("Err_amazon_getting_data!");
                errors.push(item);
                next();
              } else {
                const $ = cheerio.load(html);
                if (robotCheck == 'Robot Check') { // robot check
                  errors.push(item);
                  next();
                  // tr.newTorSession(function(torerr) {
                  //   if (torerr) console.log("Err_tor_newTorSession: ", torerr);
                  //   else console.log("Inner Ip address was changed to avoid the errors!");
                  //   setTimeout(function() { next(); }, 5000);
                  // });
                } else {
                  // first step - exist page
                  var isPage;
                  var headTitle = $("head title").text();
                  if (headTitle == 'Amazon.com Page Not Found' || headTitle == 'Page Not Found') {
                    isPage = false;
                  } else {
                    isPage = true;
                  }
                  countAll++;
                  if (isPage) { //page exist
                    // second step - exist cart button
                    if ($("#buybox #addToCart .a-box").attr('id') === 'unqualifiedBuyBox') {
                      isAddCartButton = false;
                    } else {
                      isAddCartButton = true;
                    }
                    console.log(countAll, ': ', isPage, isAddCartButton);
                    if (!isAddCartButton) {
                      noBuyBoxArr.push(item);
                    }
                    next();
                  } else {
                    detailPageNotFoundArr.push(item);
                    console.log(countAll, ': ', 'Page not found');
                    next();
                  }
                }

              }
            });
          } else {
            console.log('--Gone page detected!--');
            countAll++
            gonePageArr.push(item);
            next();
          }
        }
      }
    });
  }, function(err) {
    if (errors.length) {
      console.log('===Errors_Amazon_Scraping: ', errors.length);
      recursiveAmazonScraper(errors, callback);
    } else {
      callback();
    }
  });
}
// recursive spreadsheet scraper
var recursiveSpreadsheetScraper = function(finshedCallback) {
  doc.getRows(1, function(err, rows) {
    if (err) {
      console.log("inner spreadsheet getting err====> ", err);
      recursiveSpreadsheetScraper(finshedCallback);
    } else {
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].asin) sheetArr.push(rows[i].asin);
      }
      recursiveAmazonScraper(sheetArr, function() {
        finshedCallback();
      });
    }
  });
}
// main function
var main = function() {
  doc.useServiceAccountAuth(creds, function(err) {
    if (err) {
      console.log("Err in getting spreadsheet data===>", err);
      main();
    } else {
      recursiveSpreadsheetScraper(function() {
        console.log('===================== Finished! =====================');
        var htmlD, htmlG, htmlN;
        detailPageNotFoundArr
        gonePageArr
        noBuyBoxArr
        if (detailPageNotFoundArr.length || gonePageArr.length || noBuyBoxArr.length) { // if exist problems, notify to gabriel
          if (gonePageArr.length || detailPageNotFoundArr.length) {
            htmlD = "<b>-Product detail page NOT found-</b><br>";
            for (var i = 0; i < gonePageArr.length; i++) {
              htmlD += '<a href="' + searchUrlPrefix + gonePageArr[i] + '">' + gonePageArr[i] + '</a><br>';
            }
            for (var j = 0; j < detailPageNotFoundArr.length; j++) {
              htmlD += '<a href="' + urlPrefix + detailPageNotFoundArr[j] + '">' + detailPageNotFoundArr[j] + '</a><br>';
            }
          }
          if (noBuyBoxArr.length) {
            htmlN = "<b>-Product detail page found but no buy box-</b><br>";
            for (var k = 0; k < noBuyBoxArr.length; k++) {
              htmlN += '<a href="' + urlPrefix + noBuyBoxArr[k] + '">' + noBuyBoxArr[k] + '</a><br>';
            }
          }

          var data = {
            from: 'Problems detected sss.sss@sss.com',
            to: 'test1@info.com',
            subject: 'Problems detected in the products',
            html: ''
          };
          data.html = htmlD + htmlN + "<br><b>Detected Time: </b>" + new Date();
          var data_1 = {
            from: 'Problems detected sss.sss@sss.com',
            to: 'test@info.com',
            subject: 'Problems detected in the products',
            html: ''
          };

          data_1.html = data.html;
          mailgun.messages().send(data, function(error, body) {
             if (error) {
              console.log(error);
            } else {
              console.log(body);
            }
          });
          mailgun.messages().send(data_1, function(error, body) {
            if (error) {
              console.log(error);
            } else {
              console.log(body);
            }
          });
        }
      });
    }
  });
}

// main();
cron.schedule('0 0 4 * * *', function() {
  console.log('------started---------');
  main();
});
