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

// Function to replace text content of elements with class 'name' or 'username'
function replaceNames() {
  const elements = document.querySelectorAll('.name, .username');
  elements.forEach(element => {
    element.textContent = generateRandomName();
  });
}

// Function to initialize the extension after names are loaded
function initializeExtension() {
  // Add a DOMContentLoaded event listener if needed
  // window.addEventListener('DOMContentLoaded', replaceNames);

  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "replaceNames") {
      replaceNames();  // Call the replaceNames function
    }
  });

  // Optionally, call replaceNames immediately if needed
  replaceNames();
}

// Load names from JSON and initialize the extension
fetch(chrome.runtime.getURL('names.json'))
  .then(response => response.json())
  .then(data => {
    firstNames = data.firstNames;
    lastNames = data.lastNames;
    initializeExtension();  // Initialize after names are loaded
  })
  .catch(error => console.error('Error loading names:', error));
