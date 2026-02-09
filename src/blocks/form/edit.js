import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
} from "@wordpress/block-editor";

import {
	PanelBody,
	PanelRow,
	TextControl,
	TextareaControl,
} from "@wordpress/components";

import { useSelect } from "@wordpress/data";
import { useEffect } from "@wordpress/element";

import clsx from "clsx";

import "./editor.scss";
import ColorSettings from "./settings/ColorSettings";
import UISettings from "./settings/UISettings";

const TEMPLATE = [["mediweb/form-row", {}]];

export default function Edit({ attributes, setAttributes }) {
	const {
		sendTo,
		sendFrom,
		submitButtonAlignment,
		generatePDF,
		emailSubject,
		emailTemplate,
		colorSchema,
		uiSchema,
	} = attributes;

	const postId = useSelect((select) => {
		return select("core/editor").getCurrentPostId();
	}, []);

	// Store post ID in attributes when it's available
	useEffect(() => {
		if (postId && postId !== attributes.postId) {
			setAttributes({ postId });
		}
	}, [postId, setAttributes, attributes.postId]);

	return (
		<div
			{...useBlockProps({
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
			<InspectorControls>
				<PanelBody initialOpen={true} title="Form settings">
					<PanelRow>
						<div>
							<TextControl
								label="Send email to"
								value={sendTo}
								onChange={(email) => setAttributes({ sendTo: email })}
								type="text"
							/>
							<TextControl
								label="Send email from"
								value={sendFrom}
								onChange={(email) => setAttributes({ sendFrom: email })}
								type="text"
							/>
						</div>
					</PanelRow>
					<PanelRow>
						<div className="m-form__submit-alignment">
							<label>
								{__("Submit button alignment", "mediweb-gutenberg")}
							</label>
							<div>
								<label>
									<input
										type="radio"
										name="submit-button-alignment"
										value="left"
										checked={submitButtonAlignment === "left"}
										onChange={() =>
											setAttributes({ submitButtonAlignment: "left" })
										}
									/>
									{__("Left", "mediweb-gutenberg")}
								</label>
								<label>
									<input
										type="radio"
										name="submit-button-alignment"
										value="center"
										checked={submitButtonAlignment === "center"}
										onChange={() =>
											setAttributes({ submitButtonAlignment: "center" })
										}
									/>
									{__("Center", "mediweb-gutenberg")}
								</label>
								<label>
									<input
										type="radio"
										name="submit-button-alignment"
										value="right"
										checked={submitButtonAlignment === "right"}
										onChange={() =>
											setAttributes({ submitButtonAlignment: "right" })
										}
									/>
									{__("Right", "mediweb-gutenberg")}
								</label>
							</div>
						</div>
					</PanelRow>
					<PanelRow>
						<div>
							<label>
								<input
									type="checkbox"
									checked={generatePDF}
									onChange={() => setAttributes({ generatePDF: !generatePDF })}
								/>
								{__("Generate PDF", "mediweb-gutenberg")}
							</label>
						</div>
					</PanelRow>
					<PanelRow>
						<div>
							<TextControl
								label="Email subject"
								value={attributes.emailSubject}
								onChange={(emailSubject) => setAttributes({ emailSubject })}
								type="text"
								placeholder="Fill in email subject"
							/>
						</div>
					</PanelRow>
					{/* <PanelRow>
						<div>
							<p>
								{__(
									"Use the following placeholders in your email template:",
									"mediweb-gutenberg"
								)}
							</p>
							<ul>
								<li>{__("{firstName}", "mediweb-gutenberg")}</li>
								<li>{__("{lastName}", "mediweb-gutenberg")}</li>
								<li>{__("{email}", "mediweb-gutenberg")}</li>
								<li>{__("{phone}", "mediweb-gutenberg")}</li>
								<li>{__("{message}", "mediweb-gutenberg")}</li>
							</ul>
						</div>
					</PanelRow> */}
					<PanelRow>
						<div>
							<TextareaControl
								rows={6}
								label="Email template"
								value={attributes.emailTemplate}
								onChange={(emailTemplate) => setAttributes({ emailTemplate })}
								type="text"
								placeholder="Hello {firstName} {lastName}, thank you for your message..."
							/>
						</div>
					</PanelRow>
				</PanelBody>

				<UISettings setAttributes={setAttributes} attributes={attributes} />

				<ColorSettings setAttributes={setAttributes} attributes={attributes} />
			</InspectorControls>

			<InnerBlocks allowedBlocks={["mediweb/form-row"]} template={TEMPLATE} />
		</div>
	);
}
