
document.getElementById("startscan").addEventListener('click', async() =>
{
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getEmail,
      });    
});

function getEmail()
{
    var path = '//*[@id=":oz"]/div[1]/div[2]/div[1]/table/tbody/tr[1]/td[1]/table/tbody/tr/td/h3/span/span[2]';
    //alert(document.evaluate( path, document, null, XPathResult.STRING_TYPE, null ));
    alert(document.getElementsByClassName("go")[0].innerHTML);
}



