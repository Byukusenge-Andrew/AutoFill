// This script will interact with form fields and autofill them based on selected attributes

function autofillDummyData(selectedAttributes, customFields, settings) {
    // Load Faker.js library dynamically from CDN
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@faker-js/faker";
    document.head.appendChild(script);

    script.onload = () => {
        // First try to identify form elements on the page
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
                        dummyValue = faker.internet.email();
                    }
                } else if (field.type === 'tel' || fieldContext.includes('phone') || fieldContext.includes('mobile')) {
                    if (selectedAttributes.includes("phone")) {
                        dummyValue = faker.phone.number();
                    }
                } else if (field.type === 'date') {
                    if (selectedAttributes.includes("date")) {
                        dummyValue = faker.date.past().toISOString().split('T')[0];
                    }
                } else if (field.type === 'number') {
                    if (selectedAttributes.includes("number")) {
                        dummyValue = faker.number.int({ min: 1, max: 10000 });
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
                    dummyValue = faker.lorem.words(2);
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
    };
}

// Helper function to detect and fill field based on context
function detectAndFillField(field, fieldContext, selectedAttributes) {
    if (selectedAttributes.includes("name") && 
        (fieldContext.includes("name") || fieldContext.includes("full") || 
         fieldContext.includes("first") || fieldContext.includes("last"))) {
        if (fieldContext.includes("first")) {
            return faker.person.firstName();
        } else if (fieldContext.includes("last")) {
            return faker.person.lastName();
        } else {
            return faker.person.fullName();
        }
    } else if (selectedAttributes.includes("email") && fieldContext.includes("email")) {
        return faker.internet.email();
    } else if (selectedAttributes.includes("phone") && 
              (fieldContext.includes("phone") || fieldContext.includes("mobile") || 
               fieldContext.includes("cell") || field.type === "tel")) {
        return faker.phone.number();
    } else if (selectedAttributes.includes("address") && 
              (fieldContext.includes("address") || fieldContext.includes("street"))) {
        return faker.location.streetAddress();
    } else if (selectedAttributes.includes("city") && fieldContext.includes("city")) {
        return faker.location.city();
    } else if (selectedAttributes.includes("zip") && 
              (fieldContext.includes("zip") || fieldContext.includes("postal"))) {
        return faker.location.zipCode();
    } else if (selectedAttributes.includes("company") && fieldContext.includes("company")) {
        return faker.company.name();
    } else if (field.type === "date" && selectedAttributes.includes("date")) {
        return faker.date.past().toISOString().split('T')[0];
    } else if (field.type === "number" && selectedAttributes.includes("number")) {
        return faker.number.int({ min: 1, max: 10000 });
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
            return faker.lorem.words(3);
        case 'number':
            return faker.number.int({ min: 1, max: 10000 });
        case 'date':
            return faker.date.past().toISOString().split('T')[0];
        case 'name':
            return faker.person.fullName();
        case 'email':
            return faker.internet.email();
        default:
            return faker.lorem.word();
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
