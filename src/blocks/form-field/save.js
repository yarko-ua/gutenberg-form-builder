import { useBlockProps, RichText, InnerBlocks } from "@wordpress/block-editor";

import clsx from "clsx";

import FieldText from "./field/FieldText";
import FieldNumber from "./field/FieldNumber";
import FieldTel from "./field/FieldTel";
import FieldDate from "./field/FieldDate";
import FieldRadio from "./field/FieldRadio";
import FieldCheckbox from "./field/FieldCheckbox";
import FieldDropdown from "./field/FieldDropdown";
import FieldUpload from "./field/FieldUpload";
import FieldTextarea from "./field/FieldTextarea";

const Field = {
	text: FieldText,
	number: FieldNumber,
	tel: FieldTel,
	date: FieldDate,
	radio: FieldRadio,
	checkbox: FieldCheckbox,
	dropdown: FieldDropdown,
	file: FieldUpload,
	textarea: FieldTextarea,
};

const FieldWrapperTag = ({ type, children }) => {
	if (["radio", "checkbox"].includes(type)) {
		return <div className="field-wrapper">{children}</div>;
	}

	return <label className="field-wrapper">{children}</label>;
};

export default function save({ attributes }) {
	const {
		label,
		required,
		width,
		inline,
		name,
		type,
		isConditional,
		conditionField,
		conditionValue,
		context_conditionField,
		context_conditionValue,
		conditionalDisplayType,
		cols,
		options,
		isMultiple,
		fileInput,
	} = attributes;

	console.log("SAVE FIELD: __ ", {
		attributes,
		"is-conditional": !!context_conditionField && !!conditionValue,
	});

	const dataAttribures = conditionValue
		? {
				"data-condition-field": context_conditionField,
				"data-condition-value":
					attributes.conditionValue || context_conditionValue,
				"data-field-name": name,
		  }
		: {};

	const blockProps = useBlockProps.save({
		className: clsx("m-form__field", {
			[`type-${type}`]: type,
			inline: !!inline,
			required: !!required,
			"is-conditional": !!context_conditionField && !!conditionValue,
			"is-highlighted": attributes.highlighted,
			"conditional-display-disable":
				isConditional && conditionalDisplayType === "disable",
		}),
		// style: { width: `calc(${width}% - (var(--_row-gap) / 2))` },
		style: {
			"--field-width": `${width}% `,
			"--group-cols": `${cols}`,
			"--textareaHeight": attributes.textareaInput?.height
				? `${attributes.textareaInput.height}px`
				: undefined,
		},
		...dataAttribures,
	});

	const inputSettings = {
		name,
		label,
		context_conditionField,
		context_conditionValue,
		conditionValue: conditionValue,
		required,
		isMultiple:
			type === "checkbox" ? true : isMultiple || fileInput?.isMultiple,
	};

	if (!!options.length) {
		inputSettings.options = options;
	}

	return (
		<div {...blockProps}>
			<FieldWrapperTag type={type}>
				<>
					<RichText.Content tagName="span" value={label} />
					<div className="input-wrapper">
						{Field[type]({ ...attributes, mode: "render" })}
					</div>
				</>
			</FieldWrapperTag>
			<input
				type="hidden"
				className="input-settings"
				name="inputSettings[]"
				value={JSON.stringify(inputSettings)}
				// data-input-settings={JSON.stringify({ name, label })}
			/>
			{isConditional && <InnerBlocks.Content />}
			{/* {options && options.length > 0 && (
				<input
					type="hidden"
					className="input-settings"
					name={`inputSettings[${name}]`}
					value={JSON.stringify({ name, label, options })}
				/>
			)} */}
			{/* <input
				type="hidden"
				className="input-settings"
				name={`inputSettings[${name}]`}
				value={JSON.stringify({ name, label, options, required })}
			/> */}
		</div>
	);
}
