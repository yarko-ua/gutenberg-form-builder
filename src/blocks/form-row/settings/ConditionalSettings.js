import { ToggleControl } from "@wordpress/components";
import { PanelBody, PanelRow, TextControl } from "@wordpress/components";

export default function ConditionalSettings({
	attributes,
	setAttributes,
	context,
}) {
	const {
		conditionField,
		conditionValue,
		isConditional,
		conditionalDisplayType,
	} = attributes;

	console.log({ isConditional });

	if (!isConditional) return null;

	return (
		<PanelBody initialOpen={true} title="Conditional settings">
			<PanelRow>
				<div>
					<TextControl
						label="Condition Value"
						value={conditionValue}
						onChange={(conditionValue) => setAttributes({ conditionValue })}
					/>
				</div>
			</PanelRow>
			<PanelRow>
				<ToggleControl
					label="Conditional Display: Disable instead of Hide"
					checked={conditionalDisplayType === "disable"}
					onChange={(value) =>
						setAttributes({
							conditionalDisplayType: value ? "disable" : "hide",
						})
					}
				/>
			</PanelRow>
			<PanelRow>
				<code>
					{JSON.stringify(
						{
							isConditional,
							conditionField,
							conditionValue,
						},
						null,
						2
					)}
				</code>
			</PanelRow>
		</PanelBody>
	);
}
