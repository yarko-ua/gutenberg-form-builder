<?php 
	namespace GutenbergForm\Assets;

	// Prevent multiple loads
	static $assets_loaded = false;

	function assetPath($filepath) {
		return ["url" => GUTENBERG_FORM_PLUGIN_URL . $filepath, "path" => GUTENBERG_FORM_PLUGIN_DIR . $filepath];
	}


	function isHomePage($post = null) {
		return is_front_page();

		// Check if the post is a page and has the 'page-praticien' or 'page-patient' template
		if ($post && is_a($post, 'WP_Post') && $post->post_type === 'page') {
			$template = get_page_template_slug($post->ID);
			return $template === 'page-praticien.php' || $template === 'page-patient.php';
		}
	}


// Add this function to enqueue block styles for specific content
function enqueue_blocks_for_content($content) {
    if (empty($content)) return;
    
    // Parse blocks from content
    $blocks = parse_blocks($content);
    
    // Get all block types used in content
    $block_types = [];
    array_walk_recursive($blocks, function($item, $key) use (&$block_types) {
        if ($key === 'blockName' && !empty($item)) {
            $block_types[] = $item;
        }
    });
    
    // Remove duplicates
    $block_types = array_unique($block_types);
    
    // Enqueue styles for each block type
    foreach ($block_types as $block_type) {
        if (empty($block_type)) continue;
        
        // Convert block name to handle (e.g., 'acf/custom-block' becomes 'acf-custom-block')
        $block_handle = str_replace('/', '-', $block_type);
        
        // Try to enqueue the block style if it exists
        wp_enqueue_style($block_handle . '-style');
        
        // For ACF blocks specifically
        if (strpos($block_type, 'acf/') === 0) {
            $acf_block_name = str_replace('acf/', '', $block_type);
            wp_enqueue_style('acf-' . $acf_block_name . '-style');
        }
    }
    
    // Also enqueue core block styles
    wp_enqueue_style('wp-block-library');
    wp_enqueue_style('wp-block-library-theme');
}

	// Load CSS
	function load_css() {
		// Add Gutenberg block styles when content is loaded via get_post()
		//  wp_enqueue_style('wp-block-library');
		//  wp_enqueue_style('wp-block-library-theme');

		wp_enqueue_style('react-datepicker', "https://cdn.jsdelivr.net/npm/react-datepicker/dist/react-datepicker.css", array(), null);
		wp_enqueue_style('choices', "https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css", array(), null);
		
	}

	// Load JS
	function load_scripts() {
		wp_enqueue_script('choices', "https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js", '1.0.0', true);

		$data = wp_json_encode( [
			'url' => admin_url( 'admin-ajax.php' ),
			'nonce' => wp_create_nonce( 'mediweb-secret' ),
		] );

		$i18n = [
			// 'search' => __('Search', 'mediweb'),
			// 'noResults' => __('No results found', 'mediweb'),
			// 'loading' => __('Loading...', 'mediweb'),
			// 'error' => __('An error occurred', 'mediweb'),
			// 'loadMore' => __('Load more', 'mediweb'),
			// 'showMore' => __('Show more', 'mediweb'),
			// 'showLess' => __('Show less', 'mediweb'),
			// 'submit' => __('Submit', 'mediweb'),
			'cancel' => __('Cancel', 'mediweb'),
			'formSubmitted' => __('Merci ! <br/>Votre questionnaire médical a bien été transmis.', 'mediweb'),
			"formSubmitFailed" => __("Échec de l'envoi du formulaire", "mediweb"),
		];

	
		wp_add_inline_script( 
			'mediweb-form-view-script', 
			"
				var i18n = ".wp_json_encode($i18n).";
				var ajax = $data;
				var blogName = '".addslashes(get_bloginfo("name"))."';
			", 
			'before' 
		);

		wp_localize_script('mediweb-form-view-script', "mediwebTheme", (object)[
			'pluginUrl' => GUTENBERG_FORM_PLUGIN_URL,
			'templateUrl' => get_template_directory_uri(),
			'siteUrl' => home_url(),
			'ajaxUrl' => admin_url('admin-ajax.php'),
			'blogName' => addslashes(get_bloginfo("name")),
		]);
	}

	function load_admin_scripts() {
		wp_localize_script('wp-data', "mediwebTheme", (object)[
			'templateUrl' => GUTENBERG_FORM_PLUGIN_URL,
			'siteUrl' => home_url(),
			'ajaxUrl' => admin_url('admin-ajax.php'),
			'blogName' => addslashes(get_bloginfo("name")),
		]);
	}


	function load() {
		global $assets_loaded;
		
		if ($assets_loaded) {
			error_log('Gutenberg Form Builder: Assets already loaded, skipping...');
			return;
		}
		
		// load_css();
		// load_scripts();
		
		function assets() {
			load_css();
			load_scripts();
		}

		function admin_assets() {
			// load_admin_css();
			load_admin_scripts();
		}

		add_action('wp_enqueue_scripts', __NAMESPACE__ . '\assets');

		add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\admin_assets' );
		// add_action( 'enqueue_block_editor_assets', '\Mediweb\Assets\admin_assets' );
		// add_action( 'admin_head', '\Mediweb\Assets\admin_assets' );

		// add_editor_style(plugin_dir_url(__FILE__).'/dist/css/admin.css');
		
		$assets_loaded = true;
		error_log('Gutenberg Form Builder: Assets load complete.');
	}