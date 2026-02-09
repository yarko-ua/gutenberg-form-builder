<?php
namespace GutenbergForm\Gutenberg;

// Prevent multiple registrations
static $blocks_registered = false;
static $textdomain_loaded = false;
static $category_registered = false;

function register_blocks() {
	global $blocks_registered;
	
	if ($blocks_registered) {
		error_log('Gutenberg Form Builder: Blocks already registered, skipping...');
		return;
	}
	
	$blocks_dir = GUTENBERG_FORM_PLUGIN_DIR . 'build/blocks';
	$dir = scandir($blocks_dir);

	error_log('Gutenberg Form Builder: Registering blocks from directory: ' . $blocks_dir);
	error_log('Gutenberg Form Builder: Found blocks: ' . implode(', ', $dir));

	foreach($dir as $block) {
		if ($block !== '.' && $block !== '..' && is_dir($blocks_dir."/".$block)) {
			$block_json_path = $blocks_dir . '/' . $block . '/block.json';

      if (file_exists($block_json_path)) {
      	$block_metadata = json_decode(file_get_contents($block_json_path), true);
        $block_name = $block_metadata['name'] ?? null;
				$block_textdomain = $block_metadata['textdomain'] ?? null;

        if ($block_name && ! \WP_Block_Type_Registry::get_instance()->is_registered($block_name)) {
          register_block_type($block_json_path);

					// After registering, set up script translations
					if ($block_textdomain) {
						// WordPress automatically generates script handles for blocks
						// Pattern: {namespace}-{block-name}-{script-type}-script
						$namespace = explode('/', $block_name)[0] ?? '';
						$block_slug = explode('/', $block_name)[1] ?? '';

						// wp_set_script_translations( 'my-block-script', 'my-textdomain', get_template_directory() . '/languages' );
						
						if ($namespace && $block_slug) {
							$script_handle = $namespace . '-' . $block_slug . '-script';
							$script_path = $blocks_dir . '/' . $block . '/index.js';

							// error_log("Setting translations for block script: " . $script_handle . " with textdomain: " . $block_textdomain . " at script path: " . $script_path);

							// wp_register_script(
							// 	$script_handle,
							// 	$script_path,
							// 	[ 'wp-i18n', 'wp-element', 'wp-blocks', 'wp-editor' ],
							// 	filemtime( $script_path )
							// );

							// wp_set_script_translations( $script_handle, $block_textdomain, get_template_directory() . '/languages' );

							// Set translations for editor script
							wp_set_script_translations(
								$namespace . '-' . $block_slug . '-editor-script',
								$block_textdomain,
								GUTENBERG_FORM_PLUGIN_DIR . 'languages/'
							);
							
							// // Set translations for view script (if it exists)
							// wp_set_script_translations(
							// 	$namespace . '-' . $block_slug . '-view-script',
							// 	$block_textdomain,
							// 	get_template_directory() . '/languages/'
							// );
						}
					}
        }
      }
		}
	}
	
	$blocks_registered = true;
	error_log('Gutenberg Form Builder: Block registration complete.');
}

function mediweb_gutenberg_load_textdomain() {
	global $textdomain_loaded;
	
	if ($textdomain_loaded) {
		error_log('Gutenberg Form Builder: Gutenberg textdomain already loaded, skipping...');
		return;
	}
	
	load_plugin_textdomain(
		'mediweb-gutenberg',
		false,
		dirname(plugin_basename(GUTENBERG_FORM_PLUGIN_FILE)) . '/languages/'
	);
	
	$textdomain_loaded = true;
	error_log('Gutenberg Form Builder: Gutenberg textdomain loaded.');
}

function register_custom_block_category( $categories, $post ) {
	global $category_registered;
	
	if ($category_registered) {
		return $categories;
	}
	
	$category_registered = true;
	
	return array_merge(
			$categories,
			array(
					array(
							'slug'  => 'mediweb',
							'title' => __( 'Mediweb', 'mediweb-gutenberg' ),
							'icon'  => null, // Можна вказати іконку для категорії, якщо потрібно
					),
			)
	);
}

add_filter( 'block_categories_all', __NAMESPACE__ . '\register_custom_block_category', 10, 2 );

function createBlocks() {
	static $blocks_created = false;
	
	if ($blocks_created) {
		error_log('Gutenberg Form Builder: createBlocks already called, skipping...');
		return;
	}
	
	error_log('Gutenberg Form Builder: createBlocks called, checking if we are in init action...');
	
	// If we're already in the init action or later, call functions directly
	if (did_action('init') || current_action() === 'init') {
		error_log('Gutenberg Form Builder: We are in/after init action, calling functions directly...');
		register_blocks();
		mediweb_gutenberg_load_textdomain();
	} else {
		error_log('Gutenberg Form Builder: We are before init action, adding hooks...');
		// Register Gutenberg Form blocks
		add_action( 'init', __NAMESPACE__ . '\register_blocks' );
		// Load textdomain for translations
		add_action('init', __NAMESPACE__ . '\mediweb_gutenberg_load_textdomain');
	}
	
	$blocks_created = true;
	error_log('Gutenberg Form Builder: createBlocks complete.');
}