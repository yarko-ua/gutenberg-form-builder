<?php
namespace GutenbergForm;

error_log('Gutenberg Form Builder: Plugin file loaded - PHP execution started');

/**
 * Plugin Name: Gutenberg Form Builder
 * Plugin URI: https://your-website.com
 * Description: Advanced form builder for Gutenberg with custom fields and validation
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://your-website.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: gutenberg-form
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * Network: false
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('GUTENBERG_FORM_VERSION', '1.0.0');
define('GUTENBERG_FORM_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('GUTENBERG_FORM_PLUGIN_URL', plugin_dir_url(__FILE__));
define('GUTENBERG_FORM_PLUGIN_FILE', __FILE__);

$loader_file = dirname(__FILE__) . '/inc/Loader.php';
error_log('Gutenberg Form Builder: Looking for loader at: ' . $loader_file);
if (file_exists($loader_file)) {
    error_log('Gutenberg Form Builder: Loader found, including...');
    require_once $loader_file;
} else {
    error_log('Gutenberg Form Builder: ERROR - Loader file not found!');
}

class GutenbergFormPlugin {
    
    private static $instance = null;
    private $initialized = false;
    private $plugin_initialized = false;
    private $textdomain_loaded = false;
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        error_log('Gutenberg Form Builder: Constructor called');
        $this->init();
    }
    
    public function init() {
        if ($this->initialized) {
            error_log('Gutenberg Form Builder: Already initialized, skipping...');
            return;
        }
        
        error_log('Gutenberg Form Builder: Init method called');
        
        // Check for required dependencies first
        if (!$this->checkDependencies()) {
            error_log('Gutenberg Form Builder: Dependencies missing');
            add_action('admin_notices', [$this, 'dependencyNotice']);
            // Don't return - let the plugin load but show notice
        } else {
            error_log('Gutenberg Form Builder: Dependencies OK');
        }
        
        // Check if we're in admin or frontend
        add_action('init', [$this, 'initPlugin']);
        
        // Plugin activation/deactivation hooks
        register_activation_hook(__FILE__, [$this, 'activate']);
        register_deactivation_hook(__FILE__, [$this, 'deactivate']);
        
        // Load textdomain for translations
        add_action('init', [$this, 'loadTextdomain']);
        
        $this->initialized = true;
        error_log('Gutenberg Form Builder: Init complete');
    }
    
    public function initPlugin() {
        if ($this->plugin_initialized) {
            error_log('Gutenberg Form Builder: Plugin already initialized, skipping...');
            return;
        }
        
        error_log('Gutenberg Form Builder: Initializing plugin.');
        error_log('Gutenberg Form Builder: Current action: ' . current_action());
        error_log('Gutenberg Form Builder: Init action count: ' . did_action('init'));

        Gutenberg\createBlocks();
        Assets\load();
        AjaxRequests\registerAjaxActions();
        
        $this->plugin_initialized = true;
        error_log('Gutenberg Form Builder: Plugin initialization complete.');
    }
    
    public function activate() {
        // Plugin activation logic
        flush_rewrite_rules();
        
        // Check dependencies and show notice if missing (but don't fail)
        if (!$this->checkDependencies()) {
            // Log the issue but don't prevent activation
            error_log('Gutenberg Form Builder: Plugin activated but dependencies are missing.');
        }
    }
    
    public function deactivate() {
        // Plugin deactivation logic
        flush_rewrite_rules();
    }
    
    public function loadTextdomain() {
        if ($this->textdomain_loaded) {
            error_log('Gutenberg Form Builder: Textdomain already loaded, skipping...');
            return;
        }
        
        load_plugin_textdomain(
            'gutenberg-form',
            false,
            dirname(plugin_basename(__FILE__)) . '/languages/'
        );
        
        $this->textdomain_loaded = true;
        error_log('Gutenberg Form Builder: Textdomain loaded.');
    }
    
    /**
     * Check if Composer dependencies are installed
     */
    private function checkDependencies() {
        $autoload_file = GUTENBERG_FORM_PLUGIN_DIR . 'vendor/autoload.php';
        return file_exists($autoload_file);
    }
    
    /**
     * Show admin notice if dependencies are missing
     */
    public function dependencyNotice() {
        echo '<div class="notice notice-error"><p>';
        echo '<strong>Gutenberg Form Builder:</strong> Missing required dependencies. ';
        echo 'PDF generation functionality will not work. ';
        echo 'Please contact your administrator to install the plugin correctly ';
        echo 'or download the complete plugin package from the official source.';
        echo '</p></div>';
    }
}

// Initialize the plugin
error_log('Gutenberg Form Builder: About to initialize plugin instance');
GutenbergFormPlugin::getInstance();
error_log('Gutenberg Form Builder: Plugin instance created');