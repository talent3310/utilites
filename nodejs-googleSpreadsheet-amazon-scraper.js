var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var cron = require('node-cron');
var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('./client_secret.json');
var doc = new GoogleSpreadsheet('1YrlBSBc7djG9-zEMvHgv9yAr2moi8fi0X-VQHUFhv9E');

var sheetArr = [];
var countAll = 0;
// Authenticate with the Google Spreadsheets API.
var recursiveAmazonScraper = function(sheetArr, callback) {
  var errors = [];
  async.eachLimit(sheetArr, 3, function(item, next) {
    console.log("item======>", item);
    var url = 'http://www.amazon.com/dp/' + item;

    request(url, function(err, resp, html) {
      if (err) {
        console.log("Err_amazon_getting_data===>", err);
        errors.push(item);
        next();
      } else {
        const $ = cheerio.load(html);
        // first step - exist page
        var isPage;
        var headTitle = $("head title").text();
        if (headTitle == 'Amazon.com Page Not Found' || headTitle == 'Page Not Found') {
          isPage = false;
        } else {
          isPage = true;
        }

        if (isPage) { //page exist
          // second step - exist cart button
          if ($("#buybox #addToCart .a-box").attr('id') === 'unqualifiedBuyBox') {
            isAddCartButton = false;
          } else {
            isAddCartButton = true;
          }
          countAll++;
          console.log(countAll, ': ', isPage, isAddCartButton);
          next();
        } else {
          console.log(countAll, ': ', 'Page not exist');
          next();
        }
      }
    });
  }, function(err) {
    if (errors.length) {
      console.log('Errors_Amazon_Scraping: ', errors.length);
      recursiveAmazonScraper(errors, callback);
    } else {
      callback();

    }

  });
}
// recursive spreadsheet scraper
var recursiveSpreadsheetScraper = function() {
  doc.getRows(1, function(err, rows) {
    if (err) {
      console.log("inner-err====> ", err);
      recursiveSpreadsheetScraper();
    } else {
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].asin) sheetArr.push(rows[i].asin);
      }
      recursiveAmazonScraper(sheetArr, function() {
        console.log('== Finished! ==');
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
      recursiveSpreadsheetScraper();
    }
  });
}

main();
cron.schedule('0 0 0 * * *', function() {
  // main();
});