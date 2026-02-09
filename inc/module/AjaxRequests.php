<?php

namespace GutenbergForm\AjaxRequests;

// Prevent multiple registrations
static $ajax_actions_registered = false;

function handle_mediweb_form_submit() {
	$data = $_POST;
	$files = $_FILES;

	check_ajax_referer( 'mediweb-secret', 'security' );

	if( ! wp_verify_nonce( $_POST['security'], 'mediweb-secret' ) ) {
		//die( 'Stop!');
		wp_send_json_error(["message" => "Nonse not valid"]);
		die();
	} 

	$res = \GutenbergForm\FormSubmit\submit();

	$response = array(
		'form_data' => $data,
		"result" => $res
	);

	wp_send_json_success($response);
}

function registerAjaxActions() {
	global $ajax_actions_registered;
	
	if ($ajax_actions_registered) {
		error_log('Gutenberg Form Builder: Ajax actions already registered, skipping...');
		return;
	}
	
	add_action('wp_ajax_mediweb_form_submit', __NAMESPACE__ . '\handle_mediweb_form_submit');
	add_action('wp_ajax_nopriv_mediweb_form_submit', __NAMESPACE__ . '\handle_mediweb_form_submit');
	
	$ajax_actions_registered = true;
	error_log('Gutenberg Form Builder: Ajax actions registration complete.');
}