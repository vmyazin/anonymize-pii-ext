document.addEventListener('DOMContentLoaded', function () {

    const displayCurrentSelectors = (selectors) => {
        let displayDiv = document.getElementById('current-sel');
        if (displayDiv) {
            displayDiv.innerHTML = selectors.length > 0 ? selectors.join(', ') : 'none';
        }
    };

    const clearAllInputs = () => {
        document.querySelectorAll('input').forEach(input => input.value = '');
    };

    // Fetch and display the current selectors
    chrome.storage.sync.get('selectors', function (data) {
        let currentSelectors = data.selectors || DEFAULT_SELECTORS;
        displayCurrentSelectors(currentSelectors);
    });

    // Save button event listener
    document.getElementById('save-button').addEventListener('click', function () {
        let newSelector = document.getElementById('selectorInput').value.trim();
        chrome.storage.sync.get('selectors', function (data) {
            let currentSelectors = data.selectors || DEFAULT_SELECTORS;
            let index = currentSelectors.indexOf(newSelector);

            if (newSelector && index === -1) {
                currentSelectors.push(newSelector);
            } else if (newSelector && index !== -1) {
                currentSelectors.splice(index, 1);
            }

            chrome.storage.sync.set({ 'selectors': currentSelectors }, function () {
                displayCurrentSelectors(currentSelectors);
                clearAllInputs();
                console.log('Selectors updated:', currentSelectors);
            });
        });
    });

    // Reset to default values
    document.getElementById('reset-button').addEventListener('click', function () {
        chrome.storage.sync.set({ 'selectors': [] }, () => {
            console.log('Extension reset to default state');
            console.log('Current selectors:', DEFAULT_SELECTORS);
            displayCurrentSelectors([]);
            clearAllInputs();
        });
    });

    document.getElementById('apply-button').addEventListener('click', function () {
        // Fetch the latest selectors from storage
        chrome.storage.sync.get('selectors', function(data) {
            let currentSelectors = data.selectors || DEFAULT_SELECTORS;
    
            // Send a message to the content script with the current selectors
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "replaceNames", selectors: currentSelectors });
            });
        });
    });

    document.getElementById('extensionToggle').addEventListener('change', function() {
        var contentContainer = document.getElementById('contentContainer');
        if(this.checked) {
            // Code to enable the extension's functionality
            contentContainer.style.display = 'block';
            toggleExtensionFunctionality(this.checked)
        } else {
            contentContainer.style.display = 'none';
            // Code to disable the extension's functionality
            toggleExtensionFunctionality(!this.checked)
        }

        // Reload the current tab
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].id) {
                chrome.tabs.reload(tabs[0].id);
            }
        });
    }); 

    const toggleExtensionFunctionality = (isEnabled) => {
        if (isEnabled) {
            // Code to enable the extension's functionality
            console.log("Extension enabled");
        } else {
            // Code to disable the extension's functionality
            console.log("Extension disabled");
        }
    };

});
