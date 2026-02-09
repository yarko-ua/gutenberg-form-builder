import {
	PanelBody,
	PanelRow,
	TextControl,
	ToggleControl,
} from "@wordpress/components";

export default function ConditionalSettings({
	attributes,
	setAttributes,
	context,
}) {
	const {
		context_conditionField,
		context_conditionValue,
		conditionField,
		conditionValue,
		isConditional,
		conditionalDisplayType,
	} = attributes;

	console.log({ isConditional, context_conditionField });

	if (!isConditional && !context_conditionField) return null;

	const context_row_conditionField = context["mediweb/form/row/conditionField"];
	const context_row_conditionValue = context["mediweb/form/row/conditionValue"];

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
							context_row_conditionField,
							context_row_conditionValue,
							context_conditionField,
							context_conditionValue,
							conditionField,
							conditionValue,
							isConditional,
						},
						null,
						2
					)}
				</code>
			</PanelRow>
		</PanelBody>
	);
}
