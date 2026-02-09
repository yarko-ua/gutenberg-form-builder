import { useBlockProps, InnerBlocks } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";

import clsx from "clsx";

export default function save({ attributes, innerBlocks }) {
	const { submitButtonAlignment, colorSchema, uiSchema } = attributes;
	// console.log({ attributes });
	// console.log({ srlz: JSON.stringify({ attributes }) });

	// const formStructure = collectFormStructure(innerBlocks);

	// console.warn("SAVE FORM", { innerBlocks, formStructure });

	return (
		<form
			{...useBlockProps.save({
				className: clsx([
					"m-form",
					!!submitButtonAlignment && `is-aligned-${submitButtonAlignment}`,
				]),
				style: {
					"--_row-gap": `${attributes.rowGap}px`,
					"--_field-spacing": `${attributes.fieldSpacing}px`,
					"--_conditional-field-spacing": `${attributes.conditionalFieldSpacing}px`,
					"--_input-bg": colorSchema.inputBackground,
					"--_input-border-color": colorSchema.inputBorderColor,
					"--_input-color": colorSchema.inputTextColor,
					"--_placeholder-color": colorSchema.inputPlaceholderColor,
					"--_f-color": colorSchema.color,
					"--_input-border-color-focus":
						colorSchema.inputBorderColorFocus || colorSchema.inputBorderColor,
					"--_input-bg-active":
						colorSchema.inputBackgroundFilled || colorSchema.inputBackground,
					"--_input-color-active":
						colorSchema.inputTextColorFilled || colorSchema.inputTextColor,
					"--_input-radius": `${uiSchema.inputRadius || 0}px`,
					"--_input-radius-2": `${uiSchema.inputRadius_2 || 0}px`,
				},
			})}
		>
			<InnerBlocks.Content />
			<input
				type="hidden"
				name="formSettings"
				value={`${JSON.stringify({ ...attributes })}`}
			/>
			{/* not okay because rehydration(?) issue ? */}
			{/* <input
				type="hidden"
				name="formStructure"
				value={`${JSON.stringify(formStructure)}`}
			/> */}
			<div className="m-form__row">
				<button type="submit" className="m-button btn black">
					<span>{__("Envoyer", "mediweb-gutenberg")}</span>
				</button>
			</div>
		</form>
	);
}

function collectFormStructure(blocks) {
	if (!blocks || !Array.isArray(blocks)) return [];

	const structure = [];

	const processBlock = (block) => {
		switch (block.name) {
			case "mediweb/form-row":
				const rowStructure = {
					type: "row",
					elements: [],
				};

				if (block.innerBlocks && block.innerBlocks.length > 0) {
					block.innerBlocks.forEach((innerBlock) => {
						const element = processBlock(innerBlock);
						if (element) {
							rowStructure.elements.push(element);
						}
					});
				}

				return rowStructure;

			case "mediweb/form-field":
				const fieldStructure = {
					type: "field",
					name: block.attributes?.name || "",
					label: block.attributes?.label || "",
					fieldType: block.attributes?.type || "text",
					required: block.attributes?.required || false,
					placeholder: block.attributes?.placeholder || "",
					options: block.attributes?.options || [],
					conditionField: block.attributes?.conditionField || "",
					conditionValue: block.attributes?.conditionValue || "",
					isConditional: !!block.attributes?.conditionField,
					//Add nested fields array
					nestedFields: [],
				};

				// Recursively process nested form fields
				if (block.innerBlocks && block.innerBlocks.length > 0) {
					block.innerBlocks.forEach((innerBlock) => {
						const nestedElement = processBlock(innerBlock);
						if (nestedElement) {
							// If it's another form field, add to nestedFields
							if (nestedElement.type === "field") {
								fieldStructure.nestedFields.push(nestedElement);
							} else {
								// For other content types (headings, paragraphs),
								// you might want to add them to a different array or handle differently
								fieldStructure.nestedFields.push(nestedElement);
							}
						}
					});
				}

				return fieldStructure;

			case "core/heading":
				const headingText = extractTextFromHTML(block.originalContent || "");
				return {
					type: "heading",
					level: block.attributes?.level || 2,
					content: headingText,
				};

			case "core/paragraph":
				const paragraphText = extractTextFromHTML(block.originalContent || "");
				return {
					type: "paragraph",
					content: paragraphText,
				};

			default:
				// Handle other block types - also check for inner blocks
				const defaultStructure = {
					type: "content",
					blockName: block.name,
					content: extractTextFromHTML(block.originalContent || ""),
					innerElements: [],
				};

				// Recursively process inner blocks for unknown block types
				if (block.innerBlocks && block.innerBlocks.length > 0) {
					block.innerBlocks.forEach((innerBlock) => {
						const innerElement = processBlock(innerBlock);
						if (innerElement) {
							defaultStructure.innerElements.push(innerElement);
						}
					});
				}

				// Only return if there's content or inner elements
				if (
					defaultStructure.content.trim() ||
					defaultStructure.innerElements.length > 0
				) {
					return defaultStructure;
				}
				return null;
		}
	};

	blocks.forEach((block) => {
		const processed = processBlock(block);
		if (processed) {
			structure.push(processed);
		}
	});

	return structure;
}

function extractTextFromHTML(html) {
	if (!html) return "";

	// Create a temporary element to extract text content
	if (typeof document !== "undefined") {
		const temp = document.createElement("div");
		temp.innerHTML = html;
		return temp.textContent || temp.innerText || "";
	}

	// Fallback: simple regex to strip HTML tags
	return html.replace(/<[^>]*>/g, "").trim();
}
