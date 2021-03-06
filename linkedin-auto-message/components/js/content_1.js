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
        jQuery(item).attr("data-is-animating-click", true);
        // jQuery(item).click();
        $(item).bind('click', function (ev) {
        }).click();
        if(buttonTxt.trim() == 'Connect') {
          count ++;
          setTimeout(function() {
            jQuery("div#li-modal-container button.button-secondary-large").click();
            setTimeout(function() {
              jQuery("div#li-modal-container textarea").val(msgTxt);
              setTimeout(function() {
                jQuery("div#li-modal-container button[name='cancel']").click();
                // jQuery("div#li-modal-container button.button-primary-large").click();
                setTimeout(function() {
                  callback_1();
                }, 1000);
                
              }, 500);              
            }, 500);
          }, 1500);
        } else if(buttonTxt.trim() == 'InMail') {
          count++;
            setTimeout(function() {
              jQuery("input.msg-inmail-compose-widget__subject[name='subject']").attr("data-artdeco-is-focused", "true");
              jQuery("input.msg-inmail-compose-widget__subject[name='subject']").click();
              jQuery("input.msg-inmail-compose-widget__subject[name='subject']").on('keydown', function(){
                console.log('key pressed hello!');
              });
              jQuery("input.msg-inmail-compose-widget__subject[name='subject']").val("Hello").trigger(jQuery.Event("keydown", {keyCode: 13}));
              
              // jQuery("input.msg-inmail-compose-widget__subject[name='subject']").val('Hello');
              setTimeout(function() {
                jQuery("textarea.ember-text-area.msg-messaging-form__message[name='message']").attr("data-artdeco-is-focused", "true");
                jQuery("textarea.ember-text-area.msg-messaging-form__message[name='message']").click();
                jQuery("textarea.ember-text-area.msg-messaging-form__message[name='message']").on('keydown', function(){
                  console.log('key pressed hello000000000000000000000000000000');
                });
                jQuery("textarea.ember-text-area.msg-messaging-form__message[name='message']").val(msgTxt).trigger(jQuery.Event("keydown", {keyCode: 13}));
                
                // jQuery("textarea.ember-text-area.msg-messaging-form__message[name='message']").val(msgTxt); 

                setTimeout(function() {
                  jQuery("div#artdeco-modal-outlet button.msg-inmail-compose-widget__title-button[aria-label='Dismiss']").click();
                  // jQuery("button.msg-messaging-form__send-button[type='submit']").click(); //send button
                  setTimeout(function() {
                    callback_1();
                  }, 1000);
                }, 5000000);
              }, 1000);


            }, 1000);
        } else if(buttonTxt.trim() == 'Message') {
          count++;
          setTimeout(function() {
            e = jQuery.Event("keyup");
            e.which = 65 //enter key
            jQuery("textarea.ember-text-area.msg-form__textarea[name='message']").trigger(e);
            // jQuery("ul.msg-s-message-list.list-style-none").click();
            // jQuery("ul.msg-s-message-list.list-style-none").mouseenter();
            // jQuery("ul.msg-s-message-list.list-style-none").mousedown();


            // jQuery("textarea.ember-text-area.msg-form__textarea[name='message']").mouseenter();
            // jQuery("div.msg-form__textarea-clone.visibility-hidden").text(msgTxt);
            // jQuery("textarea.ember-text-area.msg-form__textarea[name='message']").hover();
            // jQuery("textarea.ember-text-area.msg-form__textarea[name='message']").click();
            // jQuery("textarea.ember-text-area.msg-form__textarea[name='message']").val(msgTxt);
            // jQuery("textarea.ember-text-area.msg-form__textarea[name='message']").attr("data-artdeco-is-focused", "true");
            // jQuery("textarea.ember-text-area.msg-form__textarea[name='message']").focus();
            // jQuery("textarea.ember-text-area.msg-form__textarea[name='message']").sendkeys("B");
            
            // jQuery("textarea.ember-text-area.msg-form__textarea[name='message']").trigger(jQuery.Event("keydown", {keyCode: 13})).val(msgTxt);
            // setTimeout(function() {
              
            //   jQuery("textarea.ember-text-area.msg-form__textarea[name='message']").focus();
            //   setTimeout(function() {
            //     jQuery("button.msg-overlay-bubble-header__control.js-msg-close[data-control-name='overlay.close_conversation_window']").click();
            //     // setTimeout(function() {
            //     //   callback_1();
            //     // }, 1000);
            //   }, 30000);
            // }, 1500);
          }, 3000);
        }
        
      }, 0); // human time setting
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