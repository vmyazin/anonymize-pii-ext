// Function to pick a random element from an array
function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Function to generate a random value for a category
function generateRandomValue(category, dictionaryData) {
    let randomValue = "";

    switch (category) {
        case 'names':
            let firstName = pickRandom(dictionaryData.names.firstNames);
            let lastName = pickRandom(dictionaryData.names.lastNames);
            randomValue = `${firstName} ${lastName}`;
            break;
        case 'phoneNumbers':
            randomValue = pickRandom(dictionaryData.phoneNumbers);
            break;
        case 'addresses':
            randomValue = pickRandom(dictionaryData.addresses);
            break;
        case 'emails':
            randomValue = pickRandom(dictionaryData.emails);
            break;
        default:
            randomValue = '';
            break;
    }

    return randomValue;
}

function replaceValues(selector, category, dictionaryData) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        element.textContent = generateRandomValue(category, dictionaryData);
    });
}

function applyCategoryReplacements(category, selectors, dictionaryData) {
    selectors.forEach(selector => replaceValues(selector, category, dictionaryData));
}

// Function to initialize the extension after data is loaded
function initializeExtension(dictionaryData) {
    chrome.storage.sync.get('selectors', function (data) {
        const categorySelectors = data.selectors || {}; // Assuming selectors are stored by categories

        Object.keys(categorySelectors).forEach(category => {
            categorySelectors[category].forEach(selector => {
                replaceValues(selector, category, dictionaryData);
            });
        });

        console.log("Initial selectors applied for each category");
    });
}


// At the start of the script, check if the extension is enabled
chrome.storage.sync.get('extensionEnabled', function (data) {
    const isExtensionEnabled = data.hasOwnProperty('extensionEnabled') ? data.extensionEnabled : true; // Default to true

    if (isExtensionEnabled) {

        // Load names from JSON and initialize the extension
        fetch(chrome.runtime.getURL('dictionary.json'))
            .then(response => response.json())
            .then(dictionaryData => {
                globalDictionaryData = dictionaryData;
                initializeExtension(dictionaryData);
            })
            .catch(error => console.error('Error loading dictionary:', error));
    }
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "applySelectors") {
        Object.keys(request.selectors).forEach(category => {
            applyCategoryReplacements(category, request.selectors[category], globalDictionaryData);
        });
    }
});
