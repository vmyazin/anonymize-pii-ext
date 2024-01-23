async function createCategorySection(category, data) {
    // Fetch the HTML template
    const templateResponse = await fetch(chrome.runtime.getURL('section-tpl.html'));
    const templateText = await templateResponse.text();

    // Replace placeholders in the template with actual data
    const sectionHTML = templateText
        .replace(/{{category}}/g, category)
        .replace(/{{Category Name}}/g, formatCategoryName(category))
        .replace(/{{Current Selectors}}/g, (data.selectors || []).join(', '));

    // Convert the HTML string to DOM elements
    const sectionElement = new DOMParser().parseFromString(sectionHTML, 'text/html').body.firstChild;

    // Update the class of the section container to include the category
    sectionElement.classList.add(`section-${category}`);

    // Append the new section to the content container
    document.getElementById('contentContainer').appendChild(sectionElement);

    // Add event listeners to the newly created buttons
    document.querySelector('.btn-add').addEventListener('click', function() {
        const category = this.dataset.category;
        addSelectorToCategory(category);
    });

    document.querySelector('.btn-reset').addEventListener('click', function() {
        const category = this.dataset.category;
        resetSelectorsForCategory(category);
    });
    
    console.log(`Section created for category: ${category}`);
}

function formatCategoryName(category) {
    // Split camelCase and add a space before any uppercase letter, then capitalize the first letter of the result
    return category
        // Insert a space before all caps (camelCase)
        .replace(/([A-Z])/g, ' $1')
        // Replace underscores with spaces (snake_case)
        .replace(/_/g, ' ')
        // Replace hyphens with spaces (kebab-case)
        .replace(/-/g, ' ')
        // Uppercase the first character
        .replace(/^./, str => str.toUpperCase())
        // Trim any leading space caused by the first character being uppercase
        .trim();
}

function resetSelectors(category) {
    console.log(`Reset called for category: ${category}`);
    // Implementation for resetting selectors
}

function addSelectorToCategory(category) {
    const inputElementId = `selectorInput-${category}`;
    const newSelector = document.getElementById(inputElementId).value.trim();
    const storageKey = `${category}Selectors`;

    if (newSelector) {
        chrome.storage.sync.get([storageKey], function (data) {
            let selectors = data[storageKey] || [];
            selectors.push(newSelector);
            chrome.storage.sync.set({ [storageKey]: selectors }, function () {
                console.log(`Updated selectors for ${category}:`, selectors);
                // Optionally, update the UI to reflect the new selectors
            });
        });
    }
}

function resetSelectorsForCategory(category) {
    const storageKey = `${category}Selectors`;
    chrome.storage.sync.set({ [storageKey]: [] }, function () {
        console.log(`Selectors for ${category} have been reset.`);
        // Optionally, update the UI to reflect the reset
    });
}

const categories = ['names', 'phoneNumbers', 'addresses', 'emails'];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(chrome.runtime.getURL('dictionary.json'));
        const dictionary = await response.json();
        console.log('Dictionary loaded:', dictionary);

        Object.keys(dictionary).forEach(category => {
            console.log(`Creating section for category: ${category}`);
            createCategorySection(category, dictionary[category]);
        });
    } catch (error) {
        console.error('Error loading or processing dictionary.json:', error);
    }

    function displayCurrentSelectors(category, selectors) {
        const displayDiv = document.getElementById(`${category}-current-selectors`);
        if (displayDiv) {
            displayDiv.innerHTML = selectors.length > 0 ? selectors.join(', ') : 'None';
        }
    }

    function clearAllInputs() {
        document.querySelectorAll('input').forEach(input => input.value = '');
    }

    categories.forEach(category => {
        const storageKey = `${category}Selectors`;
        chrome.storage.sync.get([storageKey], function(data) {
            const selectors = data[storageKey] || [];
            displayCurrentSelectors(category, selectors);
        });
    });

    console.log('categories', categories);


    // Fetch and display the current selectors
    chrome.storage.sync.get('selectors', function (data) {
        let currentSelectors = data.selectors;
        displayCurrentSelectors(currentSelectors);
    });

    // Save button event listener
    document.getElementById('save-button').addEventListener('click', function () {
        let newSelector = document.getElementById('selectorInput').value.trim();
        chrome.storage.sync.get('selectors', function (data) {
            let currentSelectors = data.selectors;
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
        chrome.storage.sync.get('selectors', function (data) {
            let currentSelectors = data.selectors;

            // Send a message to the content script with the current selectors
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "replaceNames", selectors: currentSelectors });
            });
        });
    });

    const toggleExtensionFunctionality = (isEnabled) => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "toggleExtension", enabled: isEnabled });
            }
        });
    };

    document.getElementById('extensionToggle').addEventListener('change', function () {
        let isEnabled = this.checked;
        var contentContainer = document.getElementById('contentContainer');
        contentContainer.style.display = isEnabled ? 'block' : 'none';

        // Save the state to local storage
        chrome.storage.sync.set({ 'extensionEnabled': isEnabled }, function () {
            console.log(`Extension state set to: ${isEnabled ? 'ON' : 'OFF'}`);
        });

        // Reload the current tab
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0] && tabs[0].id) {
                chrome.tabs.reload(tabs[0].id);
            }
        });
    });
});
