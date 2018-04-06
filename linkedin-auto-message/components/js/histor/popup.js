var LocalStorage = new LocalStorage();
LocalStorage.init();

function getCurrentTab(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    callback(tabs[0]);
  });
}

function isTabLinkedin(tab) {
  return tab.url.indexOf('linkedin.com') + 1;
}

function isTabLinkedinPymk(tab) {
  return (tab.url.indexOf('linkedin.com/search/results/people/?') + 1) ;
}

function isTabLinkedinSearch(tab) {
  return tab.url.indexOf('linkedin.com/search/results/people') + 1;
}

function sendMessageForAddContacts(tab, status, msgTxt, actionNums) {
  chrome.tabs.sendMessage(
    tab.id, {
      action: 'add_contacts',
      status: status,
      msgTxt: msgTxt,
      actionNums: actionNums
    });
}

function addContacts(status, msgTxt, actionNums) {
  getCurrentTab(function(currentTab) {
    if (isTabLinkedin(currentTab)) {
      sendMessageForAddContacts(currentTab, status, msgTxt, actionNums);
    }
  });
}

function openTab(url) {
  chrome.tabs.create({ 'url': url });
}

function updateNumberOfTotalAdded(totalAdded) {
  $('#total_added_number').text(totalAdded);
}

function generateLinks() {
  $('[data-link-url]').click(function() {
    openTab(this.getAttribute('data-link-url'));
  });
}

function translatePage() {
  var translation, attr;

  $('[data-translation]').each(function() {
    translation = this.getAttribute('data-translation');
    attr = this.getAttribute('data-translation-attr');

    if (attr !== null) {
      this.setAttribute(attr, chrome.i18n.getMessage(translation));
    } else {
      this.textContent = chrome.i18n.getMessage(translation);
    }
  });
}

function generateTogglePanels() {
  $('.can-toggle .pointer').click(function() {
    var panel = $(this).parent();

    $(panel).children('.panel-body').toggle();

    var toggleIcon = $(panel).find('.caret');

    if ($(toggleIcon).hasClass('dropup')) {
      $(toggleIcon).attr('class', 'caret');
    } else {
      $(toggleIcon).attr('class', 'dropup caret');
    }
  });
}

function showNumberInvitedNow(number) {
  console.log("number=====>", number);
  $("#number_invited_now").text(number + ' invitations was sent');
}


function buttonStopLoading() {
  var button = $('.button-loaded');

  $(button).text($(button).attr('data-add-contacts'));
  $(button).removeClass('button-loaded');
}

function listIsEmpty() {
  return parseInt($('#number_invited_now').text()) == 0;
}

function generateListOfInvitedContacts(data) {
  var isListEmpty = listIsEmpty();

  showNumberInvitedNow(data.addedContacts.length);
  console.log("data.totalAdded=========>", data.addedContacts);

  var contact, newBlock,
    resultsBlock = '#results',
    listGroupBlock = '.list-group',
    firstBlock = resultsBlock + ' .list-group-item:first';

  if (!isListEmpty) {
    firstBlock = resultsBlock + ' .list-group-item:last';
  }

  for (var key in data.addedContacts) {
    contact = data.addedContacts[key];

    if (contact !== null) {
      newBlock = $(firstBlock).clone();

      $(newBlock).find('.row-picture img')
        .attr('src', contact.img)
        .attr('data-link-url', contact.link);
      $(newBlock).find('.row-content .list-group-item-heading')
        .text(contact.initials)
        .attr('data-link-url', contact.link);
      $(newBlock).find('.row-content .list-group-item-text')
        .text(contact.title);

      $(newBlock).appendTo($(resultsBlock + ' ' + listGroupBlock));
    }
  }

  if (isListEmpty) {
    $(firstBlock).remove();
    $(resultsBlock).fadeIn();
  }
}

function showNumOfActiveFilters() {
  var numOfActiveFilters = 0;

  $.each($('#filters .togglebutton [type="checkbox"]'), function(key, el) {
    if (el.checked) {
      numOfActiveFilters++;
      $(el).parents('.form-group').addClass('active-filter');
    } else {
      $(el).parents('.form-group').removeClass('active-filter');
    }
  });

  $('#number_activated_filters').text(numOfActiveFilters);
}

function filterListeners() {
  $('#profession').keyup(function() {
    if (this.value == '') {
      $('#professionFilterStatus').prop('checked', false);
    } else {
      $('#professionFilterStatus').prop('checked', true);
    }

    showNumOfActiveFilters();
  });

  $('#filters .togglebutton [type="checkbox"]').change(showNumOfActiveFilters);
}

function getFilters() {
  var filters = {},
    input;

  $.each($('#filters .togglebutton [type="checkbox"]'), function(key, el) {
    if (el.checked) {
      input = $(el).parents('.form-group').find('.filter');

      if ($(input).val() !== '') {
        filters[$(input).attr('id')] = $(input).val();
      }
    }
  });

  return $.isEmptyObject(filters) ? null : filters;
}

function showErrorNothingToAdding() {
  $('#nothing_to_added').fadeIn(1000);

  setTimeout(function() {
    $('#nothing_to_added').fadeOut(2000);
  }, 5000);
}

$(function() {
  $("#isLoading").hide();
  $("#btn_stop").hide();
  $("#desc_stop").hide();

  // chrome.tabs.getSelected(null, function(tab) {
  //   var tablink = tab.url;
  //   if (tab.url != 'https://www.linkedin.com/feed/' && tab.url.indexOf('https://www.linkedin.com/search/results/content/?keywords=') ==-1 && tab.url.indexOf('https://www.linkedin.com/groups/') ==-1) {
  //     chrome.tabs.create({
  //       url: "https://www.linkedin.com/feed/"
  //     });
  //   }
  // });
  // translatePage();
  // generateLinks();


  getCurrentTab(function(currentTab) {

    if (isTabLinkedinPymk(currentTab)) {

      var categ = null;

      if(currentTab.url.indexOf('https://www.linkedin.com/groups/') != -1) categ = 'groups';

      $('#btn_go').click(function() {
        $("#btn_go").hide();
        $("#btn_stop").show();
        $("#isLoading").show();
        $("#desc_go").hide();
        $("#desc_stop").show();
        var actionNums = $("#percentValue").val();
        var msgTxt = $("#messageTxt").val();
        addContacts('go', msgTxt, actionNums);
      });

      $('#btn_stop').click(function() {
        $("#btn_go").show();
        $("#btn_stop").hide();
        $("#isLoading").hide();
        $("#desc_go").show();
        $("#desc_stop").hide();
        
        addContacts('stop');
      });
      // generateTogglePanels();
      // filterListeners();
      // updateNumberOfTotalAdded(LocalStorage.app.totalAdded);
      // showNumOfActiveFilters();
    } else {
      chrome.tabs.create({
        url: "https://www.linkedin.com/search/results/people/?origin=DISCOVER_FROM_SEARCH_HOME"
      });
    }
    //  else if (isTabLinkedin(currentTab)) {
    //   $('#other_linkedin').show();
    // } else {
    //   $('#not_linkedin').show();
    // }
  });

});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action == 'close_action_1') {
    console.log('action is closed');
    $("#btn_go").show();
    $("#btn_stop").hide();
    $("#isLoading").hide();
    $("#desc_go").show();
    $("#desc_stop").hide();
  }
  if (message.action == 'added_contact_to_content') {
    updateNumberOfTotalAdded(message.data.allAdded);
    generateListOfInvitedContacts(message.data);
    console.log('added_contact_to_content!');
    buttonStopLoading();
  }

  if (message.action == 'nothing_to_added') {
    console.log('nothing_to_added!');
    updateNumberOfTotalAdded(0);
    buttonStopLoading();
    showErrorNothingToAdding();
  }
});