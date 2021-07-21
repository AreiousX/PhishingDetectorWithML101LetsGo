/*function onWindowLoad() {
    
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        var tablink = tabs[0].url;

        if (tablink != 'https'){
            window.alert("Unsecured website!!");
        }
    });
  }
  
  window.onload = onWindowLoad;*/

  if(window.location.href.includes('https://')){
      alert("Secured Website");
  }
  else{
      alert("Unsecured Website!!");
  }