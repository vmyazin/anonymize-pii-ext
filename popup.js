document.addEventListener('DOMContentLoaded', function () {
    // Load the current settings when the popup opens
    chrome.storage.sync.get('className', function (data) {
        document.getElementById('className').value = data.className || 'name';
    });

    // Save button event listener in popup.js
    document.getElementById('save-button').addEventListener('click', function () {
        var className = document.getElementById('className').value;
        chrome.storage.sync.set({ 'className': className }, function () {
            console.log('Class name saved:', className);
            // Send a message to content scripts to use the new class name
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "replaceNames" });
            });
        });
    });


    document.getElementById('apply-button').addEventListener('click', function () {
        // Send a message to the content script
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "replaceNames" });
        });
    });
});
