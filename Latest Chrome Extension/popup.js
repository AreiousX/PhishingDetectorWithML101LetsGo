
  chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action == "getSource") {
      let html = request.source;
      const preinput = '{"url" : ['+ html+ ']}';
      $.ajax({
        type: "POST",
        url: "http://127.0.0.1:2408/",
        data: preinput,
        contentType: "application/json; charset=utf-8",

        success: function (response) {
          console.log(response);
          var response = response;
          fillTable(response);
        },

        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
    }
  });
  
  function onWindowLoad() {
    
    chrome.tabs.executeScript(null, {file: "getPagesSource.js"}, function() {
      // If you try and inject into an extensions page or the webstore/NTP you'll get an error
      if (chrome.runtime.lastError) {
        message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
      }
    });
  
  }

  function fillTable(response) {
    var table = document.getElementById('urlTable');
    for (var i = 0; i < response.length; i++) {
        var cell = formTableforDisplay(response[i]);
        table.insertAdjacentHTML('beforeEnd', cell);
    }
}

  function formTableforDisplay(content) {
    var url = content.URL;
    url = url.substring(0, 64);
    var probability = content.probability;
    probability = probability.toFixed(2);
    var prediction = content.result;
    if (prediction == 1){
      prediction = "Malicious";
    }
    else{
      prediction = "Safe";
    }

    var cell =
        '<tr><td class="col0">' + url + '</td>' +
        '<td class="col1">' + prediction + '</td>' +
        '<td class="col1">' + probability + '%</td></tr>'

    return cell;
}
  
  window.onload = onWindowLoad;