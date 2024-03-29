# Anonymizer of PII for Chrome

![Anonymizer Icon](icons/icon128.png)

## Description
This Chrome Extension automatically identifies elements on web pages with specific class names (like "name" or "username") and replaces their content with randomly generated names. It's designed for users who wish to see mock names instead of actual ones on web pages for privacy reasons, testing, or other purposes.

## Features
- **Dynamic Name Replacement**: Automatically replaces text in elements with classes such as "name" or "username".
- **Customizable Class Names**: Users can specify custom class names in the extension settings.
- **Random Name Generation**: Utilizes a built-in dictionary to generate realistic first and last names.
- **Easy-to-Use Settings UI**: A simple and intuitive interface to customize the extension.

## Installation
To install the extension:
1. Download the extension from the [Chrome Web Store](#) (link to be added).
2. Click 'Add to Chrome' to install.

## Usage
After installation:
1. Navigate to a web page where you want to replace names.
2. The extension will automatically replace the names in specified classes.
3. To customize class names, click the extension icon in the toolbar and enter your desired class names in the settings.

### To-do
- ability to load a custom data JSON file with content
- ability to load a local config file for selectors 
- ability to reset all settings to default
- move Reset button next to list of selectors

### Done
+ remember section open state in local storage and persist it
+ summary of selectors under the collapsed category titles (total number of actual selectors)
+ cleanse duplicate selectors

## Acknowledgments
- A special thanks to everyone who contributed to the development and testing of this extension.
- Inspired by the need for privacy and data protection in the digital age.

---
