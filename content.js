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
function replaceNames(customClassName) {
  let query = '.name, .username';
  if (customClassName) {
    query += `, .${customClassName}`;
  }

  const elements = document.querySelectorAll(query);
  elements.forEach(element => {
    element.textContent = generateRandomName();
  });
}

// Function to initialize the extension after names are loaded
function initializeExtension() {
  chrome.storage.sync.get('className', function(data) {
    replaceNames(data.className); // Use stored class name if available

    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.action === "replaceNames") {
        replaceNames(data.className); // Call the replaceNames function with stored class name
      }
    });
  });
}

// Load names from JSON and initialize the extension
fetch(chrome.runtime.getURL('names.json'))
  .then(response => response.json())
  .then(data => {
    firstNames = data.firstNames;
    lastNames = data.lastNames;
    initializeExtension(); // Initialize after names are loaded
  })
  .catch(error => console.error('Error loading names:', error));

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "replaceNames") {
        // Fetch the class name from storage and then replace names
        chrome.storage.sync.get('className', function(data) {
            replaceNames(data.className); // Call replaceNames with updated class name
        });
    }
});