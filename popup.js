document.addEventListener('DOMContentLoaded', function () {
    let classNames = DEFAULT_CLASS_NAMES;


    // Load the current settings when the popup opens
    chrome.storage.sync.get('className', function (data) {
        document.getElementById('className').value = data.className || 'name';
    });

    // Save button event listener
    document.getElementById('save-button').addEventListener('click', function () {
        let newClassName = document.getElementById('className').value.trim();
        chrome.storage.sync.get('classNames', function (data) {
            let currentClassNames = data.classNames || DEFAULT_CLASS_NAMES;
            let index = currentClassNames.indexOf(newClassName);

            if (newClassName && index === -1) {
                currentClassNames.push(newClassName);
            } else if (newClassName && index !== -1) {
                currentClassNames.splice(index, 1);
            }

            chrome.storage.sync.set({ 'classNames': currentClassNames }, function () {
                classNames = currentClassNames; // Update the local variable
                console.log('Class names updated:', currentClassNames);
            });
        });
    });


    document.getElementById('apply-button').addEventListener('click', function () {
        // Send a message to the content script
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "replaceNames" });
        });
    });

    // Reset to default values
    document.getElementById('reset-button').addEventListener('click', function () {
        chrome.storage.sync.set({ 'classNames': DEFAULT_CLASS_NAMES }, function () {
            console.log('Extension reset to default state');

            // Fetch the value from storage and log it
            chrome.storage.sync.get('classNames', function (result) {
                console.log('Current classNames:', result.classNames);
            });
        });
    });
});
