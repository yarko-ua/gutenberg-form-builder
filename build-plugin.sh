#!/bin/bash

# Build and Package Gutenberg Form Builder Plugin
# This script prepares the plugin for distribution

echo "🚀 Building Gutenberg Form Builder Plugin..."

# Check if we're in the plugin directory
if [[ ! -f "index.php" ]]; then
    echo "❌ Error: Please run this script from the plugin root directory"
    exit 1
fi

# Install PHP dependencies (production only)
echo "📦 Installing PHP dependencies..."
if command -v composer &> /dev/null; then
    composer install --no-dev --optimize-autoloader
else
    echo "⚠️  Warning: Composer not found. Make sure vendor/ directory exists."
fi

# Install JS dependencies
echo "🔧 Installing JavaScript dependencies..."
if command -v npm &> /dev/null; then
    npm install --legacy-peer-deps
else
    echo "❌ Error: npm not found. Please install Node.js"
    exit 1
fi

# Build assets
echo "🏗️  Building assets..."
if npm run build; then
    echo "✅ Assets built successfully"
else
    echo "❌ Error: Failed to build assets"
    echo "💡 Try running: npm install --legacy-peer-deps && npm run build"
    exit 1
fi

# Check required directories
echo "✅ Checking required files..."
if [[ ! -d "vendor" ]]; then
    echo "❌ Error: vendor/ directory missing. Please run 'composer install --no-dev'"
    exit 1
fi

if [[ ! -d "build" ]]; then
    echo "❌ Error: build/ directory missing. Please run 'npm run build'"
    exit 1
fi

if [[ ! -f "vendor/autoload.php" ]]; then
    echo "❌ Error: vendor/autoload.php missing. Please run 'composer install --no-dev'"
    exit 1
fi

echo "✅ Plugin is ready for distribution!"
echo ""
echo "📋 Distribution checklist:"
echo "  ✅ PHP dependencies installed (vendor/)"
echo "  ✅ JavaScript assets built (build/)"
echo "  ✅ All required files present"
echo ""
echo "📦 The plugin can now be packaged and distributed."
echo "   Include all files except: node_modules/, .git/, *.log"