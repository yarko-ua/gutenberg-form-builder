import { TextControl, PanelBody, PanelRow } from "@wordpress/components";

export default function UISettings({ setAttributes, attributes }) {
	const { rowGap, uiSchema } = attributes;

	return (
		<PanelBody title="UI Settings" initialOpen={false}>
			<PanelRow className="ui-settings">
				<div style={{ width: "100%", minWidth: "100%" }}>
					<p>Spacing settings (px)</p>
				</div>
				<TextControl
					label="Row"
					value={attributes.rowGap}
					onChange={(rowGap) => setAttributes({ rowGap: parseInt(rowGap) })}
					type="number"
					min={0}
				/>
				<TextControl
					label="Fields"
					value={attributes.fieldSpacing}
					onChange={(fieldSpacing) =>
						setAttributes({ fieldSpacing: parseInt(fieldSpacing) })
					}
					type="number"
					min={0}
				/>
				<TextControl
					label="Conditionals"
					value={attributes.conditionalFieldSpacing}
					onChange={(conditionalFieldSpacing) =>
						setAttributes({
							conditionalFieldSpacing: parseInt(conditionalFieldSpacing),
						})
					}
					type="number"
					min={0}
				/>
			</PanelRow>
			<hr />
			<PanelRow className="ui-settings">
				<div style={{ width: "100%", minWidth: "100%" }}>
					<p>Radius (px)</p>
				</div>
				<TextControl
					label="Input radius"
					value={uiSchema.inputRadius}
					onChange={(inputRadius) =>
						setAttributes({
							uiSchema: { ...uiSchema, inputRadius: parseInt(inputRadius) },
						})
					}
					type="number"
					min={0}
				/>
				<TextControl
					label="Input radius 2"
					value={uiSchema.inputRadius_2}
					onChange={(inputRadius2) =>
						setAttributes({
							uiSchema: { ...uiSchema, inputRadius_2: parseInt(inputRadius2) },
						})
					}
					type="number"
					min={0}
				/>
			</PanelRow>
		</PanelBody>
	);
}
