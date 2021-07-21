document.addEventListener('DOMContentLoaded', function() {
    var checkPageButton = document.getElementById('checkPage');
    checkPageButton.addEventListener('click', function() {
        
        window.open('https://www.google.com', '_blank');
      /*chrome.tabs.getSelected(null, function(tab) {
        d = document;
  
        var f = d.createElement('form');
        f.action = 'https://www.google.com';
        f.method = 'post';
        var i = d.createElement('input');
        i.type = 'hidden';
        i.name = 'url';
        i.value = tab.url;
        f.appendChild(i);
        d.body.appendChild(f);
        f.submit();
      });*/
    }, false);
  }, false);

  chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action == "getSource") {
      message.innerText = request.source;
    }
  });
  
  function onWindowLoad() {
    var urlDisplay = document.querySelector('#message2');
    
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        var tablink = tabs[0].url;
        urlDisplay.innerText = tablink;
    });

    var message = document.querySelector('#message');
  
    chrome.tabs.executeScript(null, {file: "getPagesSource.js"}, function() {
      // If you try and inject into an extensions page or the webstore/NTP you'll get an error
      if (chrome.runtime.lastError) {
        message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
      }
    });
  
  }
  
  window.onload = onWindowLoad;