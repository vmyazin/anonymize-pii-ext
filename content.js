// Example list of first and last names
const firstNames = ['Alex', 'Jamie', 'Chris', 'Taylor', 'Jordan'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];

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
  // Find all elements with the class 'name' or 'username'
  const elements = document.querySelectorAll('.name, .username');

  // Replace the text content of each element with a random name
  elements.forEach(element => {
    element.textContent = generateRandomName();
  });
}

// Run the replaceNames function when the DOM is fully loaded
window.addEventListener('DOMContentLoaded', replaceNames());

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "replaceNames") {
        replaceNames();  // Call the replaceNames function
    }
});