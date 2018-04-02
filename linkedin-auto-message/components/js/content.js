var status;
var msgTxt;
var actionNums;
var count = 0;
var scrollStep = 0;
var currentPageNum;

function sendMessageToBackground(obj) {
  chrome.runtime.sendMessage(obj);
}

function eachContactsList(callback) {
  console.log('---one scroll section---');
  async.eachSeries(jQuery('.search-result__actions .ember-view button.search-result__actions--primary:enabled'), function(item, callback_1) {
    if (jQuery(item).hasClass("active") || jQuery(item).hasClass("passed_1")) callback_1();
    else {
      if (status == 'stop') {
        callback_1(1, 1);
        return;
      }
      if (count >= actionNums) {
        callback_1(1, 1);
        return;
      } 
      jQuery(item).addClass("passed_1");
      var buttonTxt = jQuery(item).text(); 
      console.log('one item');
      setTimeout(function() {
        jQuery(item).css("background-color", "yellow");
        jQuery(item).css("border", "1px solid black");
        jQuery(item).click();

        if(buttonTxt.trim() == 'Connect') {
          count ++;
          setTimeout(function() {
            jQuery("div#li-modal-container button.button-secondary-large").click();
            setTimeout(function() {
              jQuery("div#li-modal-container textarea").val(msgTxt);
              setTimeout(function() {
                jQuery("div#li-modal-container button[name='cancel']").click();
                callback_1();
              }, 500);              
            }, 500);
          }, 1500);
        } else if(buttonTxt.trim() == 'InMail') {
          count++;
            setTimeout(function() {
              jQuery("input.msg-inmail-compose-widget__subject[name='subject'] ").val('Hello');
              jQuery("textarea.ember-text-area.msg-messaging-form__message[name='message'] ").val(msgTxt);
              setTimeout(function() {
                // jQuery("button.msg-messaging-form__send-button[type='submit']").click(); //send button
                jQuery("div#artdeco-modal-outlet button.msg-inmail-compose-widget__title-button[aria-label='Dismiss']").click();
                callback_1();
              }, 500);
              
            }, 1000);
        }
        
      }, 1000); // human time setting
    }
  }, function(err) {
    callback();
  });
}

function scrollDownFilters() {
  scrollStep +=240;
  scroll(0, scrollStep);
  // scroll(0, document.body.clientHeight);
  currentPageNum = jQuery('ol.results-paginator li.page-list ol li.active').text();
  setTimeout(function() {
    if (status == 'stop') return;
    eachContactsList(function() {
      if (status == 'stop') return;
      if (count >= actionNums) {
        sendMessageToBackground({
          action: 'close_action_1',
          message: {
            totalAdded: 1,
            addedContacts: 22
          }
        });
        return;
      }
      if (scrollStep < document.body.clientHeight - 600) {
        scrollDownFilters();
      } else {
        scrollStep = 0;
        jQuery('ol.results-paginator li.page-list ol li.active + li button').click();
        setTimeout(function() {
          scrollDownFilters();
        }, 2000); 
      }
    });
  }, 500); //page scroll loading time
}

function onRequest(request, sender, sendResponse) {

  status = request.status;
  msgTxt = request.msgTxt;
  actionNums = request.actionNums;
  console.log('contents: ', actionNums);
  if (request.action == 'add_contacts' && request.status == 'go') {
    if ($(window).scrollTop() == $(document).height() - $(window).height()) {
      scroll(0, 0);
    }
    scrollDownFilters();
  }

}

chrome.runtime.onMessage.addListener(onRequest);