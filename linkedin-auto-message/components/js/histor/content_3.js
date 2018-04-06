var status;
var msgTxt;
var actionNums;
var count = 0;
var scrollStep = 0;
var currentPageNum;

function sendMessageToBackground(obj) {
  chrome.runtime.sendMessage(obj);
}
function clickLink(link) {
    var cancelled = false;

    if (document.createEvent) {
      console.log('wwwwwwww');
        var event = document.createEvent("MouseEvents");
        event.initMouseEvent("click", true, true, window,
            0, 0, 0, 0, 0,
            false, false, false, false,
            0, null);
        cancelled = !link.dispatchEvent(event);
    }
    else if (link.fireEvent) {
        cancelled = !link.fireEvent("onclick");
    }
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

            clickLink(jQuery("ul.msg-s-message-list.list-style-none")[0]);
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
 
var insert_message = function(e, t, callback) {
  t.focusout().keyup().change().focus().keyup(), t.val(e)
}
var imitate_writing = function(e, t, callback) {
  ! function i(s) {
      if (e.length <= s++) return t.val(e), t.keyup();
      t.val(e.substring(0, s)), t.focusout().keyup().change().focus().keyup(), t.scrollTop(t[0].scrollHeight), " " != t.val()[t.val().length - 1] && t.focus();
      var n = Math.floor(50 * Math.random()) + 90;
      setTimeout(function() {
          i(s)
      }, n)
  }(0)
}     

function onRequest(request, sender, sendResponse) {
  setTimeout(function() {
    $("button.pv-s-profile-actions.pv-s-profile-actions--message.button-primary-large").click();
    // jQuery("#profile-wrapper").find(".pv-top-card-section").find("button.pv-s-profile-actions--message").click();
    setTimeout(function(){
      var t = $("textarea.ember-text-area.msg-form__textarea[name='message']");
       
      // t.click().focus(), t.val(''); t.focus().focusout().keyup().change();    
      // t.focus().focusout().keyup().change(), t.val(""), t.focus().focusout().keyup().change();
      setTimeout(function() { 
        t.sendkeys('A');
        t.val('How are you?');
        
        var sbmtBtn = $("button[data-control-name='send']");
        sbmtBtn.prop("disabled", false);
        setTimeout(function(){
          sbmtBtn.click();
        }, 1000);       
      }, 1000);
    }, 1000);
  }, 4000);

}

chrome.runtime.onMessage.addListener(onRequest);