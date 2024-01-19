document.addEventListener('DOMContentLoaded', function() {
    // Load the current settings when the popup opens
    chrome.storage.sync.get('className', function(data) {
        document.getElementById('className').value = data.className || 'name';
    });

    // Save the settings when the form is submitted
    document.getElementById('settings-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form from submitting normally
        var className = document.getElementById('className').value;
        chrome.storage.sync.set({'className': className}, function() {
            console.log('Settings saved');
        });
    });

    document.getElementById('apply-button').addEventListener('click', function() {
        // Send a message to the content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "replaceNames"});
        });
    });
});
