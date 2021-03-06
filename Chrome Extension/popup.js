chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.action == "getSource") {
        let html = request.source;
        const preinput = '{"url" : [' + html + ']}';
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
    chrome.tabs.executeScript(null, { file: "getPagesSource.js" }, function () {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.runtime.lastError) {
            message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
        }
    });

}

function fillTable(response) {
    waitForLoad(3000);
    var subtitle = document.getElementById('subtitle');
    subtitle.remove();
    var table = document.getElementById('urlTable');
    var counter = document.getElementById('urlCounter');
    var totalCount = 0;
    var maliciousCount = 0;
    var uri = [];
    var urlLengthNumber = [];
    var ipDectNumber = [];
    var atDectNumber = [];
    var redirectDectNumber = [];
    var urlDepthNumber = [];
    var prefixSuffixDectNumber = [];
    var shortenDetectNumber = [];
    //uri2.push(response);
    const rString = ["Malicious ads on website", "Link was found in database", "Website was found to collect sensitive information", "Sent from ap public email address", "Invalid domain name", "Domain Name is misspelt", "Url is too long"];
    for (var i = 0; i < response.length; i++) {
        var cell = formTableforDisplay(response[i]);
        totalCount++;
        if (response[i].result == 1) {
            maliciousCount++;
        }
        table.insertAdjacentHTML('beforeEnd', cell);
        if (response[i].result == 1) {
            urlLengthNumber.push(response[i].urlLength);
            ipDectNumber.push(response[i].ipDetect);
            atDectNumber.push(response[i].atDetect);
            redirectDectNumber.push(response[i].redirectDetect);
            urlDepthNumber.push(response[i].urlDepth);
            prefixSuffixDectNumber.push(response[i].prefixSuffixDetect);
            shortenDetectNumber.push(response[i].shortenDetect);
            uri.push(response[i].URL);
        }
        // alert(document.getElementsByClassName('maliciousLink')[i].innerHTML)

    }
    var countText = maliciousCount / totalCount * 100;
    countText = countText.toFixed(0);
    if (countText >= 30) {
        counterText = '<a style="font-size:15px;">This email is</a> <b><a style="color:#ff5454; font-size:20px;">MALICIOUS</a></b><a>.</a> <p style="font-size:15px;"> ' + maliciousCount + '/' + totalCount + ' (' + countText + '%) of URLs has been detected as malicious.</p>'
        counter.insertAdjacentHTML('beforeend', counterText)
    }
    else if (countText >= 20) {
        counterText = '<a style="font-size:15px;">This email is</a> <b><a style="color:#ffb554; font-size:20px;">POTENTIALLY MALICIOUS</a></b><a>.</a> <p style="font-size:15px;"> ' + maliciousCount + '/' + totalCount + ' (' + countText + '%) of URLs has been detected as malicious.</p>'
        counter.insertAdjacentHTML('beforeend', counterText)
    }
    else {
        counterText = '<a style="font-size:15px;">This email is</a> <b><a style="color:lightgreen; font-size:20px;">SAFE</a></b><a>.</a> <p style="font-size:15px;"> ' + maliciousCount + '/' + totalCount + ' (' + countText + '%) of URLs has been detected as malicious.</p>'
        counter.insertAdjacentHTML('beforeend', counterText)
    }
    let buttons = document.querySelectorAll('.testingLink');
    buttons.forEach((btn, index) => {
        btn.addEventListener("click",
            function () {


                //const ipRegex = /\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b/;
                //const ipwport = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):(6553[0-5]|655[0-2][0-9]|65[0-4][0-9][0-9]|6[0-4][0-9][0-9][0-9][0-9]|[1-5](\d){4}|[1-9](\d){0,3})$/;
                const digitRegex = /\d{10}(\d+)?/;
                const directoryRegex = /\/\w{15,}\b/;

                var alertContent = "";

                if (uri[index].match(digitRegex)) {
                    alertContent += ("URL contains a long string of numbers.\n");
                }
                if (uri[index].match(directoryRegex)) {
                    alertContent += ("Long Directory in URL.\n");
                }
                if (ipDectNumber[index] == 1) {
                    alertContent += ("IP address found in URL\n");
                }
                if (atDectNumber[index] == 1) {
                    alertContent += ("The \"@\" symbol which is rarely used in URLs is detected.\n");
                }
                if (redirectDectNumber[index] == 1) {
                    alertContent += ("URL is trying to redirect to another website.\n");
                }
                if (urlDepthNumber[index] >= 6) {
                    alertContent += ("High URL depth detected.\n");
                }
                if (prefixSuffixDectNumber[index] == 1) {
                    alertContent += ("\"-\" prefix/suffix in domain detected.\n");
                }
                if (shortenDetectNumber[index] == 1) {
                    alertContent += ("Shortening URL service detected.\n");
                }
                if (urlLengthNumber[index] >= 51) {
                    alertContent += ("URL length is " + urlLengthNumber[index] + " characters long.\n");
                }
                if (alertContent == "") {
                    alertContent += ("URL of unkown pattern detected.\n")
                }
                alert(alertContent)
            }

        );
    });
}

function formTableforDisplay(content) {
    var url = content.URL;
    url = url.substring(0, 64);
    var probability = content.probability;
    probability = probability.toFixed(2);
    var prediction = content.result;
    if (prediction == 1) {
        prediction = "Malicious";

    }
    else {
        prediction = "Safe";
    }
    if (prediction == "Malicious") {
        if (probability <= 75) {
            var cell =
                '<tr><td class="col0 maliciousLink" style="background-color:#ffb554">' + url + '</td>' +
                '<td class="col1" style="background-color:#ffb554">' + prediction + '</td>' +
                '<td class="col1" style="background-color:#ffb554">' + probability + '%</td>' +
                '<td class="col1"><button class="testingLink">?</button></td></tr>'
        }
        else {
            var cell =
                '<tr><td class="col0 maliciousLink" style="background-color:#ff5454">' + url + '</td>' +
                '<td class="col1" style="background-color:#ff5454">' + prediction + '</td>' +
                '<td class="col1" style="background-color:#ff5454">' + probability + '%</td>' +
                '<td class="col1"><button class="testingLink">?</button></td></tr>'
        }
    }
    else {
        var cell =
            '<tr><td class="col0" style="background-color:lightgreen">' + url + '</td>' +
            '<td class="col1" style="background-color:lightgreen">' + prediction + '</td>' +
            '<td class="col1" style="background-color:lightgreen">' + probability + '%</td></tr>'
    }
    return cell;
}

function waitForLoad(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

window.onload = onWindowLoad;
