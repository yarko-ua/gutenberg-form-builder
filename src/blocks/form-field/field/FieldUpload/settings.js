import {
	PanelBody,
	PanelRow,
	__experimentalNumberControl as NumberControl,
	TextControl,
} from "@wordpress/components";

import { ToggleControl } from "@wordpress/components";

export default function UploadSettings({ setAttributes, attributes }) {
	const { fileInput } = attributes;

	return (
		<PanelBody title="Upload Settings" initialOpen={true}>
			<PanelRow>
				MaxSize
				<NumberControl
					value={fileInput.maxSize || 0}
					onChange={(maxSize) =>
						setAttributes({ fileInput: { ...fileInput, maxSize } })
					}
					min={1}
					step={1}
					max={50}
				/>
			</PanelRow>
			<PanelRow>
				<TextControl
					label="Allowed File Types (comma separated)"
					value={fileInput.allowedTypes.join(", ") || ""}
					onChange={(allowedTypes) =>
						setAttributes({
							fileInput: {
								...fileInput,
								allowedTypes: allowedTypes.split(", "),
							},
						})
					}
				/>
			</PanelRow>
			<PanelRow>
				<ToggleControl
					label="Enable multiple upload"
					checked={fileInput.isMultiple}
					onChange={(value) =>
						setAttributes({ fileInput: { ...fileInput, isMultiple: value } })
					}
				/>
			</PanelRow>
		</PanelBody>
	);
}
