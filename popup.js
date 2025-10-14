// Initialize custom fields functionality
document.addEventListener('DOMContentLoaded', function() {
    // Tab navigation
    setupTabs();
    
    // Collapsible categories
    setupCollapsibleCategories();
    
    // Add custom field button
    document.getElementById('addCustomField').addEventListener('click', addCustomFieldRow);
    
    // Setup remove buttons for existing custom fields
    setupRemoveButtons();
    
    // Autofill button
    document.getElementById('autofill').addEventListener('click', handleAutofill);
});

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get the tab to show from data attribute
            const tabToShow = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(tabToShow).classList.add('active');
        });
    });
}

function setupCollapsibleCategories() {
    const categoryHeaders = document.querySelectorAll('.category-header');
    
    categoryHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const category = header.parentElement;
            const arrow = header.querySelector('svg');
            
            category.classList.toggle('collapsed');
            
            // Rotate arrow
            if (category.classList.contains('collapsed')) {
                arrow.classList.add('rotate-180');
            } else {
                arrow.classList.remove('rotate-180');
            }
        });
    });
}

function setupRemoveButtons() {
    document.querySelectorAll('.remove-field').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.custom-field-row').remove();
        });
    });
}

function addCustomFieldRow() {
    const container = document.getElementById('customFieldsContainer');
    const newRow = document.createElement('div');
    newRow.className = 'custom-field-row flex items-center p-2 border border-gray-200 rounded';
    
    newRow.innerHTML = `
        <input type="checkbox" value="custom" class="mr-2 h-4 w-4 custom-checkbox" checked> 
        <input type="text" placeholder="Field name" class="custom-field-name border border-gray-300 p-2 rounded mr-2 flex-grow text-sm">
        <select class="custom-field-type border border-gray-300 p-2 rounded text-sm">
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="color">Color</option>
        </select>
        <button class="remove-field ml-2 text-red-500 hover:text-red-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
    `;
    
    container.appendChild(newRow);
    
    // Add event listener to the remove button
    newRow.querySelector('.remove-field').addEventListener('click', function() {
        container.removeChild(newRow);
    });
}

function handleAutofill() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab.url && !activeTab.url.startsWith("chrome://")) {
            // Get standard field selections
            const selectedAttributes = Array.from(
                document.querySelectorAll('input[type="checkbox"]:not(.custom-checkbox):checked')
            ).map(input => input.value);
            
            // Get custom fields
            const customFields = Array.from(
                document.querySelectorAll('.custom-field-row')
            ).filter(row => 
                row.querySelector('.custom-checkbox').checked
            ).map(row => ({
                name: row.querySelector('.custom-field-name').value.trim(),
                type: row.querySelector('.custom-field-type').value
            })).filter(field => field.name); // Only include fields with a name
            
            // Get settings
            const settings = {
                triggerEvents: document.getElementById('triggerEvents').checked,
                fillRequired: document.getElementById('fillRequired').checked,
                smartDetection: document.getElementById('smartDetection').checked
            };
            
            // Show loading state
            const autofillButton = document.getElementById('autofill');
            const originalText = autofillButton.innerHTML;
            autofillButton.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Filling...
            `;
            autofillButton.disabled = true;
            
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                func: injectAutofillScript,
                args: [selectedAttributes, customFields, settings]
            }).then(() => {
                // Restore button state
                setTimeout(() => {
                    autofillButton.innerHTML = originalText;
                    autofillButton.disabled = false;
                }, 1000);
            }).catch((error) => {
                console.error('Script injection failed:', error);
                // Restore button state even on error
                autofillButton.innerHTML = originalText;
                autofillButton.disabled = false;
            });
        } else {
            alert("This extension cannot be used on chrome:// pages.");
        }
    });
}

// Function that will be injected into the page with all dependencies
function injectAutofillScript(selectedAttributes, customFields, settings) {
    // Simple dummy data generator (no external dependencies)
    const dummyData = {
        firstNames: ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Mary'],
        lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'],
        domains: ['example.com', 'test.com', 'demo.org', 'sample.net', 'placeholder.com'],
        streets: ['Main St', 'Oak Ave', 'Park Rd', 'First St', 'Second Ave', 'Third St', 'Elm St', 'Maple Ave'],
        cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'],
        companies: ['Tech Corp', 'Global Industries', 'Innovation Inc', 'Future Systems', 'Digital Solutions'],
        colors: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Black', 'White', 'Gray', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'],
        words: ['Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do']
    };

    function getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function generateEmail() {
        const firstName = getRandomItem(dummyData.firstNames).toLowerCase();
        const lastName = getRandomItem(dummyData.lastNames).toLowerCase();
        const domain = getRandomItem(dummyData.domains);
        return `${firstName}.${lastName}@${domain}`;
    }

    function generatePhone() {
        const area = Math.floor(Math.random() * 900) + 100;
        const first = Math.floor(Math.random() * 900) + 100;
        const second = Math.floor(Math.random() * 9000) + 1000;
        return `(${area}) ${first}-${second}`;
    }

    function generateDate() {
        const start = new Date(1970, 0, 1);
        const end = new Date();
        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return randomDate.toISOString().split('T')[0];
    }

    function generateNumber(min = 1, max = 10000) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateAddress() {
        const number = generateNumber(1, 9999);
        const street = getRandomItem(dummyData.streets);
        return `${number} ${street}`;
    }

    function generateZip() {
        return Math.floor(Math.random() * 90000) + 10000;
    }

    function generateWords(count = 3) {
        const words = [];
        for (let i = 0; i < count; i++) {
            words.push(getRandomItem(dummyData.words));
        }
        return words.join(' ');
    }

    // Process form fields immediately (no need to wait for external script)
    const forms = document.querySelectorAll('form');
    const inputFields = document.querySelectorAll('input, textarea, select');
    
    // Process each input field
    inputFields.forEach(field => {
        // Get field name from name, id, or placeholder attributes
        const fieldName = (field.name || field.id || field.placeholder || '').toLowerCase();
        let dummyValue = "";

        // Enhanced field detection using label text if available
        const labelText = getLabelTextForField(field).toLowerCase();
        const fieldContext = fieldName + ' ' + labelText;

        // Use smart detection if enabled
        if (settings && settings.smartDetection) {
            // Try to detect field type from attributes, classes, and context
            if (field.type === 'email' || field.name.includes('email') || fieldContext.includes('email')) {
                if (selectedAttributes.includes("email")) {
                    dummyValue = generateEmail();
                }
            } else if (field.type === 'tel' || fieldContext.includes('phone') || fieldContext.includes('mobile')) {
                if (selectedAttributes.includes("phone")) {
                    dummyValue = generatePhone();
                }
            } else if (field.type === 'date') {
                if (selectedAttributes.includes("date")) {
                    dummyValue = generateDate();
                }
            } else if (field.type === 'number') {
                if (selectedAttributes.includes("number")) {
                    dummyValue = generateNumber();
                }
            } else {
                // Continue with regular field detection
                dummyValue = detectAndFillField(field, fieldContext, selectedAttributes);
            }
        } else {
            // Use standard field detection
            dummyValue = detectAndFillField(field, fieldContext, selectedAttributes);
        }
        
        // Check for custom fields
        if (!dummyValue && customFields && customFields.length > 0) {
            for (const customField of customFields) {
                if (fieldContext.includes(customField.name.toLowerCase())) {
                    dummyValue = generateCustomValue(customField.type);
                    break;
                }
            }
        }

        // Conditional logic for specific fields
        if (!dummyValue && field.required && settings && settings.fillRequired) {
            // For required fields, generate default value or alert the user
            if (fieldContext.includes("email")) {
                dummyValue = "default@example.com"; // Default value for email
            } else if (fieldContext.includes("phone")) {
                dummyValue = "123-456-7890"; // Default value for phone
            } else if (fieldContext.includes("name")) {
                dummyValue = "John Doe"; // Default name
            } else {
                // For other required fields, generate some text
                dummyValue = generateWords(2);
            }
        }

        // Fill the field with the generated value
        if (dummyValue) {
            field.value = dummyValue;
            // Trigger input and change events to ensure form validation is triggered
            if (settings && settings.triggerEvents) {
                field.dispatchEvent(new Event('input', { bubbles: true }));
                field.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    });

    // Helper function to detect and fill field based on context
    function detectAndFillField(field, fieldContext, selectedAttributes) {
        if (selectedAttributes.includes("name") && 
            (fieldContext.includes("name") || fieldContext.includes("full") || 
             fieldContext.includes("first") || fieldContext.includes("last"))) {
            if (fieldContext.includes("first")) {
                return getRandomItem(dummyData.firstNames);
            } else if (fieldContext.includes("last")) {
                return getRandomItem(dummyData.lastNames);
            } else {
                return `${getRandomItem(dummyData.firstNames)} ${getRandomItem(dummyData.lastNames)}`;
            }
        } else if (selectedAttributes.includes("email") && fieldContext.includes("email")) {
            return generateEmail();
        } else if (selectedAttributes.includes("phone") && 
                  (fieldContext.includes("phone") || fieldContext.includes("mobile") || 
                   fieldContext.includes("cell") || field.type === "tel")) {
            return generatePhone();
        } else if (selectedAttributes.includes("address") && 
                  (fieldContext.includes("address") || fieldContext.includes("street"))) {
            return generateAddress();
        } else if (selectedAttributes.includes("city") && fieldContext.includes("city")) {
            return getRandomItem(dummyData.cities);
        } else if (selectedAttributes.includes("zip") && 
                  (fieldContext.includes("zip") || fieldContext.includes("postal"))) {
            return generateZip().toString();
        } else if (selectedAttributes.includes("company") && fieldContext.includes("company")) {
            return getRandomItem(dummyData.companies);
        } else if (selectedAttributes.includes("color") && 
                  (fieldContext.includes("color") || fieldContext.includes("colour") || field.type === "color")) {
            return getRandomItem(dummyData.colors);
        } else if (field.type === "date" && selectedAttributes.includes("date")) {
            return generateDate();
        } else if (field.type === "number" && selectedAttributes.includes("number")) {
            return generateNumber();
        } else if (field.tagName.toLowerCase() === "select" && selectedAttributes.includes("select")) {
            // Randomly select an option from the dropdown
            const options = field.querySelectorAll('option');
            if (options.length > 1) {
                field.value = options[Math.floor(Math.random() * (options.length - 1)) + 1].value;
                return "SELECT_HANDLED"; // Special return value to indicate select was handled
            }
        }
        
        return ""; // Return empty string if no match
    }

    // Helper function to generate custom values based on type
    function generateCustomValue(type) {
        switch (type) {
            case 'text':
                return generateWords(3);
            case 'number':
                return generateNumber();
            case 'date':
                return generateDate();
            case 'name':
                return `${getRandomItem(dummyData.firstNames)} ${getRandomItem(dummyData.lastNames)}`;
            case 'email':
                return generateEmail();
            case 'color':
                return getRandomItem(dummyData.colors);
            default:
                return getRandomItem(dummyData.words);
        }
    }

    // Helper function to get the label text for a form field
    function getLabelTextForField(field) {
        // Try to find a label that's explicitly associated with the field
        const id = field.id;
        if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) {
                return label.textContent.trim();
            }
        }
        
        // Try to find a label that contains the field
        let parent = field.parentElement;
        while (parent) {
            if (parent.tagName.toLowerCase() === 'label') {
                return parent.textContent.trim().replace(field.value, '');
            }
            
            // Check if there's a label as a sibling
            const siblings = Array.from(parent.children);
            for (const sibling of siblings) {
                if (sibling.tagName.toLowerCase() === 'label' && sibling !== field) {
                    return sibling.textContent.trim();
                }
            }
            
            // Move up the DOM tree
            parent = parent.parentElement;
            
            // Limit the depth to avoid infinite loops
            if (parent && parent.tagName.toLowerCase() === 'body') {
                break;
            }
        }
        
        return '';
    }
}
