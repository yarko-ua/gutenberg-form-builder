<?php function medical_quiz_generate_pdf($post_id, $content)
{
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
		'margin_header' => 0,
		'margin_top' => 5,
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


	$logo = GUTENBERG_FORM_PLUGIN_URL . 'question-file/img/logo.svg';

    $pdf_content .= '<main style="padding: 30px;">';

    // content
    $pdf_content .= $content;

    $pdf_content .= '</main>';

    require GUTENBERG_FORM_PLUGIN_DIR . 'question-file/template/quiz_pdf_template.php';

    $mpdf->SetHTMLHeader( $headerContent );
	$mpdf->SetHTMLFooter( $footerContent );

	$questions = json_decode(get_field('form_questions', $post_id), true);

	$last_name = $questions['input'][3] ? $questions['input'][3] : $post_id; /// Very bad solution, cause field can be no name or be empty

    $filename = 'Questionnaire_Médical_'.$last_name.'.pdf';

    $file_dir = $_SERVER['DOCUMENT_ROOT'] . '/wp-content/temp/' . $filename;
    $mpdf->WriteHTML( '<div style="padding: 50px">' . $pdf_content . '</div>' );
    $mpdf->Output($file_dir, 'F');

    return $file_dir;
}

?>