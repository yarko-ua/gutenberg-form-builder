# Gutenberg Form Builder

Advanced form builder for WordPress Gutenberg with custom fields, validation, and PDF generation.

## Installation

### For End Users (Plugin Installation)

1. Download the complete plugin package (including `vendor/` folder)
2. Upload the plugin files to `/wp-content/plugins/gutenberg-form-builder/`
3. Activate the plugin through the 'Plugins' screen in WordPress
4. The plugin is ready to use immediately

**Important**: Make sure you download the complete plugin package that includes the `vendor/` directory with PHP dependencies.

### For Developers

#### Prerequisites

- PHP 7.4 or higher
- Composer
- Node.js and npm

#### Development Setup

1. **Clone/Download the plugin**

   ```bash
   cd wp-content/plugins/
   # Place gutenberg-form-builder folder here
   ```

2. **Install PHP Dependencies**

   ```bash
   cd gutenberg-form-builder
   composer install --no-dev --optimize-autoloader
   ```

3. **Install JavaScript Dependencies**

   ```bash
   npm install
   ```

4. **Build Assets**
   ```bash
   npm run build
   ```

#### Development Commands

- `npm run start` - Start development with hot reload
- `npm run build` - Build production assets
- `npm run build:custom` - Build custom webpack configuration
- `npm run start-all` - Start both main and custom builds
- `npm run build-all` - Build all assets
- `composer install` - Install PHP dependencies

#### Building for Distribution

To prepare the plugin for distribution:

1. **Using the build script** (Recommended):

   ```bash
   ./build-plugin.sh
   ```

2. **Manual process**:

   ```bash
   # Install PHP dependencies (production only)
   composer install --no-dev --optimize-autoloader

   # Install JS dependencies and build
   npm install
   npm run build
   ```

**Important**: The final plugin package should include the `vendor/` directory with all PHP dependencies.

## Dependencies

### PHP Dependencies (Composer)

- `mpdf/mpdf ^8.2` - PDF generation library

### JavaScript Dependencies (npm)

- `@wordpress/scripts` - WordPress build tools
- `@wordpress/components` - WordPress React components
- `react-datepicker` - Date picker component
- `react-sortable-hoc` - Drag and drop functionality

## Features

- **Gutenberg Integration**: Native WordPress block editor support
- **Form Builder**: Drag-and-drop form creation
- **Field Types**: Various input types including file uploads, date pickers
- **PDF Generation**: Automatic PDF creation from form submissions
- **Email Integration**: Send form data via email with attachments
- **Multilingual Support**: Translation ready
- **Validation**: Client and server-side form validation

## File Structure

```
gutenberg-form-builder/
├── build/                 # Compiled assets
├── inc/                   # PHP includes
│   ├── module/           # Core modules
│   └── Loader.php        # Autoloader
├── src/                   # Source files
│   └── blocks/           # Block definitions
├── languages/            # Translation files
├── vendor/              # Composer dependencies
├── composer.json        # PHP dependencies
├── package.json         # JavaScript dependencies
└── index.php           # Main plugin file
```

## Troubleshooting

### Missing Dependencies Error

If you see an admin notice about missing dependencies, this means the plugin was installed without the required PHP libraries.

**Solutions**:

1. **Re-download**: Get the complete plugin package that includes the `vendor/` folder
2. **For Developers**: Run `composer install --no-dev --optimize-autoloader` in the plugin directory
3. **Contact Support**: Get help from the plugin provider

The plugin will still work for basic functionality, but PDF generation will be disabled until dependencies are available.

### Build Issues

If blocks don't appear or assets aren't loading:

1. Rebuild assets:

   ```bash
   npm run build-all
   ```

2. Check file permissions for the `build/` directory

## License

GPL v2 or later

## Support

For support and bug reports, please contact the plugin administrator.
