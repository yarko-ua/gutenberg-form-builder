import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	InnerBlocks,
	RichText,
	InspectorControls,
} from "@wordpress/block-editor";
import { useEffect } from "@wordpress/element";
import { PanelBody, PanelRow, CheckboxControl } from "@wordpress/components";
import ConditionalSettings from "./settings/ConditionalSettings";

import clsx from "clsx";
import "./editor.scss";

const TEMPLATE = [["mediweb/form-field", {}]];

export default function Edit({ attributes, setAttributes, context }) {
	const { header } = attributes;
	const blockProps = useBlockProps({
		className: clsx("m-form__row", {
			"is-highlighted": attributes.highlighted,
		}),
	});

	console.log("ROW CONTEXT", { context });

	const isConditional = context["mediweb/form/field/isConditional"];
	const conditionField = context["mediweb/form/field/conditionField"];
	const conditionValue =
		attributes.conditionValue || context["mediweb/form/field/conditionValue"];

	useEffect(() => {
		if (isConditional) {
			setAttributes({
				isConditional: true,
				conditionField,
				conditionValue,
			});
		} else {
			setAttributes({
				isConditional: false,
				conditionField: "",
				conditionValue: "",
			});
		}
	}, [isConditional, conditionField, conditionValue]);

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title={__("Highlighted Settings", "mediweb")}>
					<PanelRow>
						<CheckboxControl
							label={__("Highlight this field", "mediweb")}
							checked={attributes.highlighted}
							onChange={(highlighted) => setAttributes({ highlighted })}
						/>
					</PanelRow>
				</PanelBody>
				<ConditionalSettings
					attributes={attributes}
					setAttributes={setAttributes}
					context={context}
				/>
			</InspectorControls>
			<InnerBlocks
				allowedBlocks={["mediweb/form-field", "core/heading", "core/paragraph"]}
				template={TEMPLATE}
			/>
		</div>
	);
}
