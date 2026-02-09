import { PanelColorSettings } from "@wordpress/block-editor";
import { PanelBody, PanelRow } from "@wordpress/components";

export default function ColorSettings({ setAttributes, attributes }) {
	const {
		colorSchema: {
			inputBackground,
			inputTextColor,
			inputBorderColor,
			inputPlaceholderColor,
			inputBorderColorFocus,
			inputBackgroundFilled,
			inputTextColorFilled,
			color,
		},
	} = attributes;

	const setColorAttributes = (newColors) => {
		setAttributes({ colorSchema: { ...attributes.colorSchema, ...newColors } });
	};

	return (
		<>
			<PanelBody title="Color Settings">
				<PanelColorSettings
					title="Colors"
					initialOpen={true}
					colorSettings={[
						{
							value: color,
							onChange: (color) => setColorAttributes({ color: color }),
							label: "Form Color",
						},
						{
							value: inputBackground,
							onChange: (color) =>
								setColorAttributes({ inputBackground: color }),
							label: "Background",
						},
						{
							value: inputTextColor,
							onChange: (color) =>
								setColorAttributes({ inputTextColor: color }),
							label: "Text",
						},
						{
							value: inputPlaceholderColor,
							onChange: (color) =>
								setColorAttributes({ inputPlaceholderColor: color }),
							label: "Placeholder",
						},
						{
							value: inputBorderColor,
							onChange: (color) =>
								setColorAttributes({ inputBorderColor: color }),
							label: "Border",
						},
						{
							value: inputBorderColorFocus,
							onChange: (color) =>
								setColorAttributes({ inputBorderColorFocus: color }),
							label: "Border Focus",
						},

						{
							value: inputBackgroundFilled,
							onChange: (color) =>
								setColorAttributes({ inputBackgroundFilled: color }),
							label: "Background Filled",
						},
						{
							value: inputTextColorFilled,
							onChange: (color) =>
								setColorAttributes({ inputTextColorFilled: color }),
							label: "Text Filled",
						},
					]}
				/>
			</PanelBody>
		</>
	);
}
