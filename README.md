# Form Auto-Fill Extension

A Chrome extension that automatically fills web forms with realistic dummy data for testing and development purposes.

## Features

- **Comprehensive Field Support**: Detects and fills text inputs, emails, phones, addresses, dates, numbers, companies, colors (named and hex), and more.
- **Smart Detection**: Automatically identifies field types based on labels, placeholders, and input attributes.
- **Custom Fields**: Add your own custom field types with specific values.
- **Color Support**: Fills color inputs with named colors (e.g., "Red", "Blue") or hex codes (e.g., "#FF0000").
- **Local Data Generation**: Uses built-in dummy data generators to avoid external dependencies and CSP issues.
- **Tailwind CSS Integration**: Includes custom padding and fill utilities for enhanced styling.
- **Accessibility**: Proper ARIA attributes for screen reader support.

## Installation

1. Download or clone this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right.
4. Click "Load unpacked" and select the extension folder (`d:\helper\ext`).
5. The extension should now appear in your extensions list.

## Usage

1. Click the extension icon in the Chrome toolbar to open the popup.
2. Select the field types you want to auto-fill (e.g., Name, Email, Phone, Colors).
3. Optionally, add custom fields with specific values.
4. Navigate to a web page with a form.
5. Click "Auto-Fill Form" in the popup.
6. The extension will detect and fill compatible fields with dummy data.

### Custom Fields

- Click "Add Custom Field" in the popup.
- Enter a field name (e.g., "Username") and value (e.g., "testuser123").
- The extension will look for inputs matching this name and fill them accordingly.

### Color Fields

- Enable "Colors" in the "Other Fields" section.
- The extension will fill color inputs with random named colors or hex values.

## Testing

Use the included `test-form.html` file to test the extension locally:

1. Open `test-form.html` in Chrome.
2. Open the extension popup and click "Auto-Fill Form".
3. Verify that all fields are filled with appropriate dummy data.

## Development

### File Structure

- `manifest.json`: Extension manifest (Manifest V3).
- `popup.html`: Main popup interface.
- `popup.js`: Popup logic and data injection.
- `content.js`: (Legacy) Original content script with Faker.js (not used).
- `styles.css`: Custom styles and Tailwind utilities.
- `test-form.html`: Test form for validation.

### Building and Customization

- Edit `popup.js` to modify dummy data arrays or add new field types.
- Update `styles.css` to customize the popup appearance.
- Modify `manifest.json` if additional permissions are needed.

### Dependencies

- No external dependencies (all data generation is local).
- Tailwind CSS classes are included inline.

## Permissions

- `activeTab`: Allows the extension to access the current tab for form filling.
- `scripting`: Enables injection of the autofill script into web pages.

## Troubleshooting

- **CSP Errors**: The extension uses local data generation to avoid Content Security Policy violations.
- **Fields Not Filling**: Ensure field labels/placeholders match expected patterns, or use custom fields.
- **Colors Not Working**: Check that color inputs have `type="color"` or appropriate attributes.

## License

This project is open-source. Feel free to modify and distribute.