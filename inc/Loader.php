<?php

	$modules = [
		// "Helpers",
		"Gutenberg",
		"FormCapture",
		"Assets",
		"GutenbergFormSubmit",
		"AjaxRequests",
	];

	foreach ($modules as  $module) {
		if (file_exists(dirname(__FILE__) . "/module/$module.php")){
			require_once dirname(__FILE__) . "/module/$module.php";
		}
	}
