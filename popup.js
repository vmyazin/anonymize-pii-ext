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
    sectionElement.querySelector('.btn-add').addEventListener('click', function () {
        const category = this.dataset.category;
        addSelectorToCategory(category);
    });

    sectionElement.querySelector('.btn-reset').addEventListener('click', function () {
        const category = this.dataset.category;
        resetSelectorsForCategory(category);
    });
    console.log(`Section created for category: ${category}`);

    updateTotalSelectorsForCategory(category);
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

function addSelectorToCategory(category) {
    const inputElementId = `selectorInput-${category}`;
    const newSelector = document.getElementById(inputElementId).value.trim();
    const storageKey = `${category}Selectors`;

    if (newSelector) {
        chrome.storage.sync.get([storageKey], function (data) {
            let selectors = data[storageKey] || [];
            // Check for duplicate selector
            if (!selectors.includes(newSelector)) {
                selectors.push(newSelector);
                chrome.storage.sync.set({ [storageKey]: selectors }, function () {
                    console.log(`Updated selectors for ${category}:`, selectors);
                    // Update the UI
                    const currentSelectorsDiv = document.getElementById(`${category}-current-selectors`);
                    if (currentSelectorsDiv) {
                        currentSelectorsDiv.textContent = selectors.join(', ');
                    }
                    updateTotalSelectorsForCategory(category);
                });
            }
            document.getElementById(inputElementId).value = '';
        });
    }
}

function resetSelectorsForCategory(category) {
    const storageKey = `${category}Selectors`;
    chrome.storage.sync.set({ [storageKey]: [] }, function () {
        console.log(`Selectors for ${category} have been reset.`);
        // Optionally, update the UI to reflect the reset
        displayCurrentSelectors(category, []);
    });

    updateTotalSelectorsForCategory(category);
}

function displayCurrentSelectors(category, selectors) {
    const displayDiv = document.getElementById(`${category}-current-selectors`);
    if (displayDiv) {
        displayDiv.innerHTML = selectors.length > 0 ? selectors.join(', ') : 'None';
    }
    console.log("Current selectors:", selectors, "for category:", category);
}

function aggregateSelectors(callback) {
    let allSelectors = {};
    const categories = ['names', 'phoneNumbers', 'addresses', 'emails'];
    let categoriesProcessed = 0;

    categories.forEach(category => {
        const storageKey = `${category}Selectors`;
        chrome.storage.sync.get([storageKey], function (data) {
            allSelectors[category] = data[storageKey] || [];
            categoriesProcessed++;
            if (categoriesProcessed === categories.length) {
                callback(allSelectors);
            }
        });
    });
}

function clearAllInputs() {
    document.querySelectorAll('input').forEach(input => input.value = '');
}

function toggleSectionExpansion() {
    const categoryTitles = document.querySelectorAll('.category-title');

    categoryTitles.forEach((title) => {
        title.addEventListener('click', () => {
            const parentSection = title.parentElement;
            parentSection.classList.toggle('expanded');
            const isExpanded = parentSection.classList.contains('expanded');
            const sectionClass = parentSection.classList[0]; // Assuming the first class uniquely identifies the section
            console.log(`Toggled expansion for: ${sectionClass}, Expanded: ${isExpanded}`);
            localStorage.setItem(sectionClass, isExpanded.toString());
        });
    });
}

function updateTotalSelectorsForCategory(category) {
    const storageKey = `${category}Selectors`;
    chrome.storage.sync.get([storageKey], function (result) {
        const selectors = result[storageKey] || [];
        // Find the .total-num span in the created section
        const totalNumSpan = document.querySelector(`.section-${category} .total-num`);
        if (totalNumSpan) {
            totalNumSpan.textContent = selectors.length; // Update with the current number of selectors
            // Check if the total is 0 and add 'zero' class; else, remove it
            if (selectors.length === 0) {
                totalNumSpan.classList.add('zero');
            } else {
                totalNumSpan.classList.remove('zero');
            }
        }
    });
}

const categories = [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(chrome.runtime.getURL('dictionary.json'));
        const dictionary = await response.json();
        console.log('Dictionary loaded:', dictionary);

        Object.keys(dictionary).forEach(category => {
            console.log(`Creating section for category: ${category}`);
            createCategorySection(category, dictionary[category]);
            categories.push(category);
        });
    } catch (error) {
        console.error('Error loading or processing dictionary.json:', error);
    }

    setTimeout(() => {
        toggleSectionExpansion();
    }, 100);

    categories.forEach(category => {
        const storageKey = `${category}Selectors`;
        chrome.storage.sync.get([storageKey], function (data) {
            const selectors = data[storageKey] || [];
            setTimeout(() => displayCurrentSelectors(category, selectors), 200);
            // displayCurrentSelectors(category, selectors);
            console.log("Current selectors:", selectors, "for category:", category);
        });
    });

    document.getElementById('apply-button').addEventListener('click', function () {
        aggregateSelectors(function (allSelectors) {
            // Send a message to the content script with all the selectors
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "applySelectors", selectors: allSelectors });
            });
        });
    });

    // Restore the state of each section
    setTimeout(() => {
        document.querySelectorAll('[class^="section-"]').forEach(section => {
            // Extracts the section class (e.g., "section-names") as the key
            const sectionClassKey = section.className.split(' ')[0]; // Assumes it's the first class
            const isExpanded = localStorage.getItem(sectionClassKey) === 'true';
            if (isExpanded) {
                section.classList.add('expanded');
            }
        });
    }, 300);

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
