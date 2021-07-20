
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
    alert(document.getElementsByClassName("gD")[0].getAttribute('email'));
}



