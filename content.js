let firstNames = [];
let lastNames = [];

// Function to pick a random element from an array
function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Function to generate a random full name
function generateRandomName() {
    const firstName = pickRandom(firstNames);
    const lastName = pickRandom(lastNames);
    return `${firstName} ${lastName}`;
}

// Function to replace text content of elements with a specific class
function replaceNames(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        element.textContent = generateRandomName();
    });
}

// Function to initialize the extension after names are loaded
function initializeExtension() {
    chrome.storage.sync.get('selectors', function (data) {
        const selectors = data.selectors || DEFAULT_SELECTORS;
        selectors.forEach(selector => replaceNames(selector));

        // Listen for messages from the popup
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.action === "replaceNames") {
                // Use the selectors provided in the message
                request.selectors.forEach(selector => replaceNames(selector));
            }
        });
    });
}

// Load names from JSON and initialize the extension
fetch(chrome.runtime.getURL('dictionary.json'))
    .then(response => response.json())
    .then(data => {
        firstNames = data.firstNames;
        lastNames = data.lastNames;
        initializeExtension(); // Initialize after names are loaded
    })
    .catch(error => console.error('Error loading names:', error));

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "replaceNames") {
        // Fetch the class name from storage and then replace names
        chrome.storage.sync.get('className', function (data) {
            replaceNames(data.className); // Call replaceNames with updated class name
        });
    }
});