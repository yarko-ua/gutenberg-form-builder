import { useBlockProps, RichText, InnerBlocks } from "@wordpress/block-editor";
import clsx from "clsx";

export default function save({ attributes, context }) {
	const {
		header,
		isConditional,
		conditionField,
		conditionValue,
		conditionalDisplayType,
	} = attributes;

	const dataAttribures = isConditional
		? {
				"data-condition-field": conditionField,
				"data-condition-value": conditionValue,
		  }
		: {};

	const blockProps = useBlockProps.save({
		className: clsx("m-form__row", {
			"is-conditional": isConditional,
			"is-highlighted": attributes.highlighted,
			"conditional-display-disable":
				isConditional && conditionalDisplayType === "disable",
		}),
		...dataAttribures,
		// style: { marginTop: conditional ? "40px" : "0px" },
	});

	console.log("SAVE ROW", { attributes, context });

	return (
		<div {...blockProps}>
			<InnerBlocks.Content />
		</div>
	);
}
