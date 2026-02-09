<?php

namespace GutenbergForm\FormSubmit;

function create_temp_dir() {
	$temp_dir = WP_CONTENT_DIR . '/temp';

	if ( ! file_exists( $temp_dir ) ) {
		wp_mkdir_p( $temp_dir );
	}
}

add_action("init", __NAMESPACE__ . "\create_temp_dir");

function submit() {
	$data = $_POST;
	// $files = $_FILES;

	$uploaded_files = handle_file_uploads();

	// error_log(json_encode(["uploaded_files" => $uploaded_files], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

	// error_log(json_encode(["received_files" => $files], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

	$form_settings = stripslashes($data['formSettings']);
	// error_log($form_settings);
	$form_settings = json_decode($form_settings, true);
	// error_log($form_settings);
	// $form_structure = isset($data['formStructure']) ? 
  //       json_decode(stripslashes($data['formStructure']), true) : [];
	$post_id = $form_settings['postId'] ?? null; // or determine which post contains the form
	$form_structure = get_post_meta($post_id, '_form_structures', true);

	// error_log(json_encode(["form_structure" => $form_structure, "post_id" => $post_id], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

	// Handle inputs name and label
	// $inputSettings = $data['inputSettings'] ?: [];
	// $inputSettings = array_map(function($item) {
	// 	return json_decode(stripslashes($item), true);
	// }, $inputSettings);

	unset($data['inputSettings']);

	// error_log(json_encode(["data" => $data], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

	$send_to = $form_settings["sendTo"] ?: null;
	$send_from = $form_settings["sendFrom"] ?: null;
	$generatePDF = $form_settings["generatePDF"] ?: null;
	$email_subject = $form_settings["emailSubject"] ?: "";
	$email_template = $form_settings["emailTemplate"] ?: "";

	unset($data['security']);
	unset($data['action']);
	unset($data['formSettings']);


	$pdf_content = "";
	// $pdf_content .= '<h1 style="text-align: center">Questionnaire Médical</h1>';
	$clientName = $data["surname"] ?? "";

	if (!empty($form_structure)) :
		$pdf_content .= generate_structured_form_html($form_structure, $data);
	else :


	endif;

	$file_dir = "";

	if ($generatePDF) {
		$file_dir = mediweb_form_generate_pdf($pdf_content,  $clientName);
	}

	$email_subject =  preg_replace("/%clientName%/", $clientName, $email_subject);

	// error_log(json_encode(["pdf content" => $pdf_content], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

	$email = [
		"subject" => $email_subject ?: "",
		"content" => 	$email_template . "\n\n" . $pdf_content,
	];


	error_log(json_encode(["file_dir" => $file_dir]));

	$attachments = [];

	if ($file_dir && file_exists($file_dir)) {
		$attachments[] = $file_dir;
	}

	 // Add uploaded files as attachments
       foreach ($uploaded_files as $field_name => $file_info) {
        if (is_array($file_info)) {
            // Multiple files for this field
            foreach ($file_info as $single_file) {
                if (file_exists($single_file['file_path'])) {
                    $attachments[] = $single_file['file_path'];
                }
            }
        } else {
            // Single file for this field
            if (file_exists($file_info['file_path'])) {
                $attachments[] = $file_info['file_path'];
            }
        }
    }

	mediweb_form_send_mail($email, $attachments, $send_to, $send_from);
	// mediweb_form_send_mail($pdf_content, $file_dir, $clientName, $send_to, $send_from);

	// if ($file_dir && file_exists($file_dir)) {
	// 	unlink($file_dir);
	// }

	if (!empty($attachments) && is_array($attachments)) {
		foreach ($attachments as $attachment) {
			if (file_exists($attachment)) {
				unlink($attachment);
			}
		}
	}

	return $pdf_content;

}


function mediweb_form_send_mail($email = ["content" => "", "subject" => ""], $attachments = [""], $send_to = null, $sent_from = null) {
  $questionairePage = null;
	$admin_email = \get_option('admin_email');
	$email_from = $sent_from ?: $admin_email;
	$email_to  = $send_to ?: $admin_email;

	// error_log(json_encode(["email_from" => $email_from, "email_to" => $email_to]));

	$headers = "From: ".$email_from."\r\n" .
               'X-Mailer: PHP/' . \phpversion() . "\r\n" .
               'MIME-Version: 1.0' . "\r\n" .
               "Content-Type: text/html; charset=utf-8\r\n";

	// $pdf_content = $content;

	$subject = $email['subject'] ?: "";
	$message = $email['content'] ?: "";
	// $subject = 'Nouveau Questionnaire médical : ' . $clientName;
	// $message = '<h1 style="text-align: center">Questionnaire Médical</h1>';
	// $message .= "<p>Bonjour,</p>
  //   <p>Un nouveau questionnaire médical à été rempli sur votre site, le voici :</p>
	// 	" .$pdf_content;

	try {
		//code...
		$sent = \wp_mail(
    	$email_to,
			$subject,
			$message,
			$headers,
			$attachments
    );   

		error_log(json_encode(["sent" => $sent]));

		
	} catch (\Throwable $th) {
		//throw $th;
		error_log(json_encode(["th" => $th]));
	}
}

function mediweb_form_generate_pdf($content, $name = null) {
	$autoload_file = GUTENBERG_FORM_PLUGIN_DIR . 'vendor/autoload.php';
	
	if (!file_exists($autoload_file)) {
		error_log('Gutenberg Form Builder: Composer autoload not found. Please run composer install.');
		return false;
	}
	
	require_once $autoload_file;

  $mpdf = new \Mpdf\Mpdf([
      'default_font_size' => 9,
			'mode' => 'utf-8',
			'format' => 'A4',
			'margin_header' => 0, //mm
			'margin_top' => 30, //mm total
			'margin_footer' => 5,
			'margin_bottom' => 25,
			'default_font' => 'FreeSans',
			'margin_left' => 5,
			'margin_right' => 5,
			'pagenumPrefix' => 'Page ',
			'pagenumSuffix' => '',
			'nbpgPrefix' => '',
			'nbpgSuffix' => '',
			'aliasNbPg' => ' [pagetotal] '
  ]);

	$mpdf->autoScriptToLang = true;
	$mpdf->baseScript = 1;
	$mpdf->autoVietnamese = true;
	$mpdf->autoArabic = true;
	$mpdf->autoLangToFont = true;
	$mpdf->SetTitle(get_bloginfo( 'name' ));
	$mpdf->SetCreator(get_bloginfo('name'));
	$mpdf->ignore_invalid_utf8 = true;

	$pdf_content = "";
  $pdf_content .= '<main style="padding: 0px;">';
	$pdf_content .= '<h1 style="text-align: center">Questionnaire Médical</h1>';

  // content
  $pdf_content .= $content;
  $pdf_content .= '</main>';

	[$headerContent, $footerContent] = get_pdf_template();

  $mpdf->SetHTMLHeader( $headerContent );
	$mpdf->SetHTMLFooter( $footerContent );

	// $questions = json_decode(get_field('form_questions', $post_id), true);

	// $last_name = $questions['input'][3] ? $questions['input'][3] : $post_id; /// Very bad solution, cause field can be no name or be empty
		$file_id = $name ?: time();

    $filename = 'Questionnaire_Médical_'.$file_id.'.pdf';

    $file_dir = $_SERVER['DOCUMENT_ROOT'] . '/wp-content/temp/' . $filename;
    $mpdf->WriteHTML( '
		<style>
		 .form-row {
		  	margin: 0 0 24px !important;
		 }
		.form-row p {
				margin: 0 !important;
		}
		.form-row  > * {
			margin-bottom: 12px !important;
		}
		.form-row  h2 {
				margin: 20px 0 !important;
		}
		.form-row  > *:first-child {
			margin-top: 0px !important;
		}
		.nested-fields {
				margin: 0 0 0 20px !important;
		}
		.nested-fields .form-row {
				margin: 0 !important;
		}
		</style>
			<div style="padding: 10px">
		' . $pdf_content . '</div>' );
    $mpdf->Output($file_dir, 'F');

    return $file_dir;
};


function get_pdf_template() {
	$logo = GUTENBERG_FORM_PLUGIN_URL . 'public/images/svg/logo.svg';

	$headerContent = '
			<style="
				/* Outlines the grid, remove when sending */
				/* table td { border:1px solid cyan; } */
				/* CLIENT-SPECIFIC STYLES */
				body,
				table,
				td,
				a {
					-webkit-text-size-adjust: 100%;
					-ms-text-size-adjust: 100%;
					font-family: FreeSans,sans-serif;
				}
				table,
				td {
					mso-table-lspace: 0pt;
					mso-table-rspace: 0pt;
				}
				img {
					-ms-interpolation-mode: bicubic;
				}
				/* RESET STYLES */
				img {
					border: 0;
					outline: none;
					text-decoration: none;
				}
				table {
					border-collapse: collapse !important;
				}
				body {
					margin: 0 !important;
					padding: 0 !important;
					width: 100% !important;
				}
				/* iOS BLUE LINKS */
				a[x-apple-data-detectors] {
					color: inherit !important;
					text-decoration: none !important;
					font-size: inherit !important;
					font-family: inherit !important;
					font-weight: inherit !important;
					line-height: inherit !important;
				}
				/* GMAIL BLUE LINKS */
				u+#body a {
					color: inherit;
					text-decoration: none;
					font-size: inherit;
					font-family: inherit;
					font-weight: inherit;
					line-height: inherit;
				}
				/* Default Unordered list style*/
				ul {
					margin: 0px;
					padding-left: 30px;
				}
				/* Default Ordered list style*/
				ol {
					margin: 0px;
					padding-left: 25px;
				}
				li {
					font-size: 16px;
					font-family: FreeSans,sans-serif;
					color: #404040;
					margin-bottom: 20px;
					padding-left: 8px;
				}
				/* Default Paragraph style */
				p {
					font-size: 16px;
					font-family: FreeSans,sans-serif;
					color: #404040;
					margin: 0px 0px 0px;
				}
			">

			<!--[if mso]> <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#FFFFFF"> <tr> <td> <![endif]-->

			<!-- Header -->
			<table width="100%" height="100%" border="0" align="center" valign="middle" cellpadding="0" cellspacing="0" style="margin:0 auto; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; border-bottom: 1px solid #000;display: block;position:absolute !important;">
				<tr>
					<td width="40%" align="left" style="padding:0px 0px 0px 20px; height: 70px">';

	if($logo) {
		$headerContent .= '<img src="'.esc_url_raw($logo).'" style="max-width: max-content;height: 70px;"/>';
	}

	$headerContent .= '</td><td width="60%" align="right" style="padding:0px 20px 0px 0px;font-weight: 600;"><strong>'.get_bloginfo( 'name' ).'</strong></td>';


	$headerContent .= '
		</tr>
		<tr>
			<td height="15" style="padding:0; line-height: 15px;"></td>
		</tr>
	</table>';

	$footerContent = '
		<table width="100%" border="0" align="center" valign="middle"  cellpadding="0" cellspacing="0" style="margin:0 auto; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; border-top: 1px solid #000;">
			<tr>
				<td height="15" style="padding:0; line-height: 15px;"></td>
			</tr>
			<tr>
				<td width="600" align="left" style="padding:0px;font-weight: 600;" width="40%">'.get_bloginfo( 'name' ).'</td>
				<td align="right" style="padding:0px;font-weight: 600;" width="60%">{PAGENO}</td>
			</tr>
		</table>
	</table>';

	return  [$headerContent, $footerContent];
}


function generate_structured_form_html($structure, $field_data) {
    $html = '<div class="form-content">';
    
    foreach ($structure as $item) {
        if ($item['type'] === 'row') {
            $html .= '<div class="form-row" style="margin-bottom: 24px;">';
            
            foreach ($item['elements'] as $element) {
                $html .= process_form_element($element, $field_data, 0);
            }
            
            $html .= '</div>';
        }
    }
    
    $html .= '</div>';
    return $html;
}

function process_form_element($element, $field_data, $depth = 0) {
    $indent = str_repeat('  ', $depth); // For nested styling
    $html = '';
    
    switch ($element['type']) {
        case 'row':
            // Handle nested rows (can occur in nested fields)
            // $html .= "{$indent}<div class=\"form-row nested-row\" style=\"margin-left: " . (($depth - 1) * 15) . "px;\">";

						// error_log("PROCESSING NESTED ROW: " . json_encode($element, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

						$is_highlighted = $element['is_highlighted'] ?? false;
						$highlight_styles = !empty($element["elements"]) && $is_highlighted ? 'border: 2px solid #D32F2F; padding: 0 4px; border-radius: 4px;' : '';

            $html .= "{$indent}<div class=\"form-row nested-row\" style=\"$highlight_styles\">";
            
            if (!empty($element['elements'])) {
                foreach ($element['elements'] as $rowElement) {
                    $html .= process_form_element($rowElement, $field_data, $depth + 1);
                }
            }
            
            $html .= "{$indent}</div>";
            break;
            
        case 'heading':
            $level = $element['level'];
            $content = esc_html($element['content']);
            if ($content) {
                $html .= "{$indent}<h{$level} style=\"margin-block: 20px;\">{$content}</h{$level}>";
            }
            break;
            
        case 'paragraph':
            $content = esc_html($element['content']);
            if ($content) {
                $html .= "{$indent}<p>{$content}</p>";
            }
            break;
            
        case 'field':
            $name = $element['name'];
            $label = esc_html($element['label']);
						$is_highlighted = $element['is_highlighted'] ?? false;
            
            // Skip conditional fields that shouldn't be shown
            if ($element['isConditional'] && !should_show_conditional_field($element, $field_data)) {
                break;
            }

						$highlight_styles = $is_highlighted ? 'color: #D32F2F;' : '';
            
            // Process main field data
            $value = process_field_value($name, $field_data);
            
            if (!empty($value)) {
							$label = !empty($label) ? rtrim($label, ":") : "";
							//handle label in such way that if it ends in ? when dont add colon
							if (str_ends_with($label, "?")) {
								$label_markup = !empty($label) ? '<strong style="'. $highlight_styles .'">'.$label.'</strong> ' : "";
							} else {
								$label_markup = !empty($label) ? '<strong style="'. $highlight_styles .'">'.$label.'</strong> : ' : "";
							}

              $html .= "{$indent}<p>{$label_markup}<span>{$value}</span></p>";
            }
            
            // Process nested fields recursively - handle both rows and direct elements
            if (!empty($element['nestedFields'])) {
                $html .= "{$indent}<div class=\"nested-fields\" style=\"margin-left: 20px;\">";
                foreach ($element['nestedFields'] as $nestedField) {
                    $html .= process_form_element($nestedField, $field_data, $depth + 1);
                    
                    // Log nested field for debugging
                    if (!empty($nestedField['name'])) {
                        // error_log(json_encode([
                        //     "nestedField" => $nestedField, 
                        //     "value" => $field_data[$nestedField['name']] ?? 'not_set'
                        // ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
                    }
                }
                $html .= "{$indent}</div>";
            }
            break;
            
        case 'content':
            $content = esc_html($element['content']);
            if ($content) {
                $html .= "{$indent}<div>{$content}</div>";
            }
            
            // Process inner elements recursively - handle both rows and direct elements
            if (!empty($element['innerElements'])) {
                foreach ($element['innerElements'] as $innerElement) {
                    $html .= process_form_element($innerElement, $field_data, $depth + 1);
                }
            }
            break;
            
        default:
            // Handle unknown types - check if they have elements or innerElements
            if (!empty($element['elements'])) {
                // Treat as row-like structure
                $html .= "{$indent}<div class=\"unknown-type-{$element['type']}\" style=\"margin-left: " . ($depth * 15) . "px;\">";
                foreach ($element['elements'] as $subElement) {
                    $html .= process_form_element($subElement, $field_data, $depth + 1);
                }
                $html .= "{$indent}</div>";
            } elseif (!empty($element['innerElements'])) {
                // Treat as content-like structure
                foreach ($element['innerElements'] as $innerElement) {
                    $html .= process_form_element($innerElement, $field_data, $depth + 1);
                }
            }
            break;
    }
    
    return $html;
}

function should_show_conditional_field($field_element, $field_data) {

		// error_log(json_encode(["checking_condition" => $field_element, "field_data" => $field_data], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

    // If field is not conditional, always show it
    if (!$field_element['isConditional'] || empty($field_element['conditionField'])) {
        return true;
    }
    
    $condition_field = $field_element['conditionField'];
    $condition_value = $field_element['conditionValue'];
    
    // If the condition field doesn't exist in submitted data, don't show
    if (!isset($field_data[$condition_field])) {
        return false;
    }
    
    $field_values = $field_data[$condition_field];

		// error_log("CONDITION FIELD EXIST: " . json_encode(["field_values" => $field_values, "condition_value" => $condition_value, "should_show" => $field_values === $condition_value], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    
    // Handle array values (checkboxes, multi-select)
    if (is_array($field_values)) {
        // Check if condition value exists in any of the submitted values
        foreach ($field_values as $key => $value) {
            if (is_numeric($key)) {
                // For your array structure where numeric keys hold the selected values
                if ($value === $condition_value) {
                    return true;
                }
            }
        }
        return false;
    } else {
        // Handle single values (radio, select, text)

				// error_log("SINGLE VALUE CHECK: ");

        return $field_values === $condition_value;
    }
}

function process_field_value($name, $field_data) {
    if (!isset($field_data[$name]) || $field_data[$name] === '') {
        return '';
    }
    
    $value = $field_data[$name];
    
    if (is_array($value)) {
        // Use your existing array processing logic
        $selected = [];
        foreach ($value as $k => $v) {
            if (is_numeric($k)) {
                $selected[] = $v;
            }
        }
        
        // Build items: "Option (detail)" when a detail exists under the option key
        $items = [];
        if (!empty($selected)) {
            foreach ($selected as $opt) {
                $opt = stripslashes((string) $opt);
                $detail = null;
                if (isset($value[$opt]) && $value[$opt] !== '') {
                    $detail = stripslashes((string) $value[$opt]);
                }
                $items[] = $detail ? $opt . ' (' . $detail . ')' : $opt;
            }
            return implode(', ', $items);
        } else {
            // Fallback: implode all non-empty values
            $flat = [];
            foreach ($value as $k => $v) {
                if ($v !== '') {
                    $flat[] = stripslashes((string) $v);
                }
            }
            return implode(', ', $flat);
        }
    } else {
        // Handle single values
        return stripslashes((string) $value);
    }
}

function handle_file_uploads() {
    $uploaded_files = [];
    
    if (!empty($_FILES)) {
        // Create uploads directory if it doesn't exist
        $upload_dir = wp_upload_dir();
        $custom_dir = $upload_dir['basedir'] . '/form-uploads/';
				// $files_dir = $_SERVER['DOCUMENT_ROOT'] . '/wp-content/temp/';
        
        if (!file_exists($custom_dir)) {
            wp_mkdir_p($custom_dir);
				}

					// error_log("FILES: " . json_encode(["_FILES" => $_FILES]), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        
         foreach ($_FILES as $field_name => $file_data) {
            // Check if this is a multiple file upload
            if (is_array($file_data['name'])) {
                // Multiple files - restructure the array
                $files = [];
                $file_count = count($file_data['name']);
                
                for ($i = 0; $i < $file_count; $i++) {
                    $files[] = [
                        'name' => $file_data['name'][$i],
                        'type' => $file_data['type'][$i],
                        'tmp_name' => $file_data['tmp_name'][$i],
                        'error' => $file_data['error'][$i],
                        'size' => $file_data['size'][$i]
                    ];
                }
                
                $uploaded_files[$field_name] = [];
                
                foreach ($files as $index => $file) {
                    if ($file['error'] === UPLOAD_ERR_OK) {
                        $uploaded_file = process_single_file($file, $custom_dir, $upload_dir);
                        if ($uploaded_file) {
                            $uploaded_files[$field_name][] = $uploaded_file;
                        }
                    } else {
                        error_log("Upload error for {$field_name}[{$index}]: " . $file['error']);
                    }
                }
            } else {
                // Single file upload
                if ($file_data['error'] === UPLOAD_ERR_OK) {
                    $uploaded_file = process_single_file($file_data, $custom_dir, $upload_dir);
                    if ($uploaded_file) {
                        $uploaded_files[$field_name] = [$uploaded_file]; // Store as array for consistency
                    }
                } else {
                    error_log("Upload error for {$field_name}: " . $file_data['error']);
                }
            }
        }
    }
    
    return $uploaded_files;
}

function process_single_file($file, $custom_dir, $upload_dir) {
    // Generate unique filename to avoid conflicts
    $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = sanitize_file_name(pathinfo($file['name'], PATHINFO_FILENAME));
    error_log("Uploading file: " . $file['name'] . " as " . $filename);
    $unique_filename = $filename . '_' . time() . '_' . rand(1000, 9999) . '.' . $file_extension;
    $destination = $custom_dir . $unique_filename;
    
    // Move uploaded file to permanent location
    if (move_uploaded_file($file['tmp_name'], $destination)) {
        $uploaded_file = [
            'original_name' => $file['name'],
            'file_path' => $destination,
            'file_url' => $upload_dir['baseurl'] . '/form-uploads/' . $unique_filename,
            'file_size' => $file['size'],
            'file_type' => $file['type']
        ];
        
        error_log("File uploaded successfully: " . json_encode($uploaded_file));
        return $uploaded_file;
    } else {
        error_log("Failed to move uploaded file: " . $file['name']);
        return null;
    }
}