<?php
namespace GutenbergForm\FormCapture;

function capture_form_structures_on_save($post_id, $post, $update) {
    // Skip revisions and autosaves
    if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
        return;
    }
    
    // Only process posts that might contain forms
    if (!in_array($post->post_type, ['page', 'post'])) {
        return;
    }
    
    $blocks = parse_blocks($post->post_content);

		$form_present = array_find($blocks, fn($block) => $block['blockName'] === 'mediweb/form');

		if (!$form_present) {
			// No form blocks found, remove any existing meta and exit
			error_log("No form blocks found in post $post_id, removing existing meta if any.");
			delete_post_meta($post_id, '_form_structures');
			return;
		}

		// Debug: log the parsed blocks

		error_log("Parsing blocks for post $post_id " . json_encode($blocks, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    $form_structures = extract_all_form_structures($blocks);
    
    // Debug: log the complete structure
    if (!empty($form_structures)) {
        error_log("Form structures captured: " . json_encode($form_structures, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        update_post_meta($post_id, '_form_structures', $form_structures);
    } else {
        error_log("No form structures found in post $post_id");
        delete_post_meta($post_id, '_form_structures');
    }
}

function extract_all_form_structures($blocks) {
    $structures = [];
    
    foreach ($blocks as $block) {
        if ($block['blockName'] === 'mediweb/form') {
            $structure = extract_single_form_structure($block);
            if (!empty($structure)) {
                // $structures[] = $structure;
                $structures = $structure;
            }
        }
        
        // Recursively check inner blocks
        // if (!empty($block['innerBlocks'])) {
        //     $nested_structures = extract_all_form_structures($block['innerBlocks']);
        //     $structures = array_merge($structures, $nested_structures);
        // }
    }

		error_log("Extracted form structures: PHP " . json_encode($structures, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    return $structures;
}

function extract_single_form_structure($form_block) {
    $structure = [
        // 'rows' => []
				// "type": "row", "elements": []}
    ];
    
    if (empty($form_block['innerBlocks'])) {
        return $structure;
    }
    
    foreach ($form_block['innerBlocks'] as $row_block) {
        if ($row_block['blockName'] === 'mediweb/form-row') {
            $row = extract_row_structure($row_block);
            if (!empty($row['elements'])) {
                // $structure['rows'][] = $row;
                $structure[] =  [
										'type' => 'row',
										'elements' => $row['elements']
						];
                // $structure['rows'][] = $row;
            }
        } else {
            // Handle direct elements in form (not in rows)
            // $element = extract_element_structure($row_block);
            // if ($element) {
            //     $structure[] = [
            //         'type' => 'row',
            //         'elements' => [$element]
            //     ];
            // }
        }
    }
    
    return $structure;
}

function extract_row_structure($row_block) {
    $row = [
        'elements' => []
    ];
    
    if (empty($row_block['innerBlocks'])) {
        return $row;
    }
    
    foreach ($row_block['innerBlocks'] as $element_block) {
        $element = extract_element_structure($element_block);
        if ($element) {
            $row['elements'][] = $element;
        }
    }
    
    return $row;
}

function extract_element_structure($block) {
    $block_name = $block['blockName'];
    $attrs = $block['attrs'] ?? [];
    
    switch ($block_name) {
				case "mediweb/form-row":
					$rowStructure = [
						'type' => "row",
						"is_highlighted" => $attrs['highlighted'] ?? false,
						'elements' => [],
					];

					if (!empty($block['innerBlocks'])) {
						foreach ($block['innerBlocks'] as $innerBlock) {
							$element = extract_element_structure($innerBlock);
							if ($element) {
								$rowStructure['elements'][] = $element;
							}
						}
					}

					return $rowStructure;
  
        case 'mediweb/form-field':
            $field_structure = [
                'type' => 'field',
                'name' => $attrs['name'] ?? '',
                'label' => $attrs['label'] ?? '',
                'fieldType' => $attrs['type'] ?? 'text',
                'required' => $attrs['required'] ?? false,
                'placeholder' => $attrs['placeholder'] ?? '',
                'options' => $attrs['options'] ?? [],
                'conditionField' => $attrs['context_conditionField'] ?? '',
                // 'conditionValue' => $attrs['context_conditionValue'] ?? ,
                'conditionValue' => $attrs['context_conditionValue'] ?? $attrs["conditionValue"],
                'isConditional' => !empty($attrs['context_conditionField']),
								"is_highlighted" => $attrs['highlighted'] ?? false,

                'nestedFields' => []
            ];
            
            // Handle nested fields recursively
            if (!empty($block['innerBlocks'])) {
                foreach ($block['innerBlocks'] as $nested_block) {
                    $nested_element = extract_element_structure($nested_block);

                    if ($nested_element) {
                        $field_structure['nestedFields'][] = $nested_element;
                    }
                }
            }
            
            return $field_structure;
            
        case 'core/heading':
            // Try multiple sources for heading content
            $content = '';
            
            // First try innerHTML
            if (!empty($block['innerHTML'])) {
                $content = strip_tags($block['innerHTML']);
            }
            
            // If empty, try attributes content
            if (empty($content) && !empty($attrs['content'])) {
                $content = strip_tags($attrs['content']);
            }
            
            // Debug: log what we're getting
            error_log("Heading block debug: " . json_encode([
                'innerHTML' => $block['innerHTML'] ?? 'not set',
                'attrs' => $attrs,
                'extracted_content' => $content
            ]));
            
            if (!empty($content)) {
                return [
                    'type' => 'heading',
                    'level' => $attrs['level'] ?? 2,
                    'content' => trim($content)
                ];
            }
            return null;
            
        case 'core/paragraph':
            // Similar approach for paragraphs
            $content = '';

						// Exclude from structure;
						return null;
            
            if (!empty($block['innerHTML'])) {
                $content = strip_tags($block['innerHTML']);
            }
            
            if (empty($content) && !empty($attrs['content'])) {
                $content = strip_tags($attrs['content']);
            }
            
            // Debug: log paragraph content
            error_log("Paragraph block debug: " . json_encode([
                'innerHTML' => $block['innerHTML'] ?? 'not set',
                'attrs' => $attrs,
                'extracted_content' => $content
            ]));
            
            if (!empty($content)) {
                return [
                    'type' => 'paragraph',
                    'content' => trim($content)
                ];
            }
            return null;
            
        default:
            // Handle other blocks generically
            $content = '';
            
            if (!empty($block['innerHTML'])) {
                $content = strip_tags($block['innerHTML']);
            }
            
            if (!empty($content)) {
                return [
                    'type' => 'content',
                    'blockName' => $block_name,
                    'content' => trim($content)
                ];
            }
            return null;
    }
}

add_action('save_post', __NAMESPACE__ . '\\capture_form_structures_on_save', 10, 3);