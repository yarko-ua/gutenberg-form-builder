import clsx from "clsx";

import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	InnerBlocks,
	RichText,
	InspectorControls,
	BlockControls,
} from "@wordpress/block-editor";

import {
	PanelBody,
	PanelRow,
	CheckboxControl,
	__experimentalNumberControl as NumberControl,
	TextControl,
	Button,
	__experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,
	CustomSelectControl,
	Toolbar,
	ToolbarItem,
} from "@wordpress/components";

import {
	useEffect,
	useState,
	lazy,
	Suspense,
	useCallback,
	useRef,
	useMemo,
} from "@wordpress/element";

import { SortableContainer, SortableElement } from "react-sortable-hoc";
import { arrayMoveMutable } from "array-move";

import { loadFieldComponent } from "./helpers/loadFieldComponent";
import sanitizeInputName from "./helpers/sanitizeInputName";

import CheckboxSettings from "./field/FieldCheckbox/settings";
import DropdownSettings from "./field/FieldDropdown/settings";
import DateSettings from "./field/FieldDate/settings";
import ConditionalSettings from "./settings/ConditionalSettings";
import UploadSettings from "./field/FieldUpload/settings";
import { FIELD_TYPE_OPTIONS } from "./const/FIELD_TYPE";

import "./editor.scss";

const FieldWrapperTag = ({ type, children }) => {
	if (["radio", "checkbox"].includes(type)) {
		return <div className="field-wrapper">{children}</div>;
	}

	return <label className="field-wrapper">{children}</label>;
};

export default function Edit({ attributes, setAttributes, context }) {
	const {
		label,
		required,
		width,
		inline,
		name,
		placeholder,
		type,
		options,
		isConditional,
		conditionField,
		conditionValue,
		context_conditionField,
		context_conditionValue,
		cols,
		dateInputType,
	} = attributes;

	const context_row_conditionField = context["mediweb/form/row/conditionField"];
	const context_row_conditionValue = context["mediweb/form/row/conditionValue"];

	const textareaRef = useRef();
	const resizeObserverRef = useRef();

	const [textareaInput, setTextareaInput] = useState(() => {
		return attributes.textareaInput || {};
	});

	console.log("FIELD CONTEXT " + label, { context, conditionValue });

	useEffect(() => {
		if (context_row_conditionField) {
			setAttributes({
				context_conditionField: context_row_conditionField,
				context_conditionValue: context_row_conditionValue,
			});
		} else {
			setAttributes({
				context_conditionField: "",
				context_conditionValue: "",
			});
		}
	}, [context_row_conditionField, context_row_conditionValue]);

	const blockProps = useBlockProps({
		className: clsx("m-form__field", {
			[`type-${type}`]: type,
			inline: !!inline,
			required: !!required,
			"is-highlighted": attributes.highlighted,
		}),
		// style: { width: `calc(${width}% - (var(--_row-gap) / 2))` },
		style: {
			"--field-width": `${width}% `,
			"--group-cols": `${cols}`,
			"--textareaHeight": attributes.textareaInput?.height
				? `${attributes.textareaInput.height}px`
				: undefined,
		},
	});

	const handleOptionValue = useCallback((options, i, val) => {
		let newOptions = [...options];
		console.log({ opts: options, opt: newOptions[i], i, val });
		newOptions[i].value = val;
		// newOptions[i] = option;
		setAttributes({ options: newOptions });
	}, []);

	const handleExtraInputLabelChange = useCallback((options, i, val) => {
		let newOptions = [...options];
		console.log({ opts: options, opt: newOptions[i], i, val });

		if (!newOptions[i].extraInput) {
			// newOptions[i].extraInput = {
			// 	label: "",
			// 	name: "",
			// };
			console.warn("No extraInput found for option", newOptions[i]);
			return;
		}

		newOptions[i].extraInput.label = val;
		// newOptions[i] = option;
		setAttributes({ options: newOptions });
	}, []);

	const [FieldComponent, setFieldComponent] = useState(null);

	const handleRemoveOption = useCallback(
		(i) => {
			const newOptions = [...options];
			newOptions.splice(i, 1);
			setAttributes({ options: newOptions });
		},
		[options]
	);

	const onSortEnd = ({ oldIndex, newIndex }) => {
		const newOptions = [...options]; // Копіюємо масив
		arrayMoveMutable(newOptions, oldIndex, newIndex); // Змінюємо місця елементів у цьому ж масиві
		setAttributes({ options: newOptions }); // Оновлюємо state
	};

	const onOptionChange = useCallback((options, i, val) => {
		let newOptions = [...options];
		console.log({ opts: options, opt: newOptions[i], i, val });
		newOptions[i].value = val;
		// newOptions[i] = option;
		setAttributes({ options: newOptions });
	}, []);

	useEffect(() => {
		let isMounted = true;

		loadFieldComponent(type).then((mod) => {
			if (isMounted) {
				// console.log("mod.def", mod.default);
				// if type is radio or checkbox then pass callback function to remove options to the component
				if (mod.default) {
					// mod.default.removeOptions = (i) => {
					// 	const newOptions = [...options];
					// 	newOptions.splice(i, 1);
					// 	setAttributes({ options: newOptions });xsw
					// };
				}
				// if (["radio", "checkbox"].includes(type)) {
				// 	mod.default.onRemoveOption = handleRemoveOption;
				// }

				setFieldComponent(() => mod.default);
			}
		});

		return () => {
			isMounted = false;
		};
	}, [type]);

	// Set name attribute based on label if name is not set
	useEffect(() => {
		if (!name) {
			const sanitizedLabel = sanitizeInputName(label);
			setAttributes({ name: sanitizedLabel });
		}
	}, [name, label]);

	//sanitize existed name on load
	useEffect(() => {
		if (name) {
			const sanitizedName = sanitizeInputName(name);
			if (sanitizedName !== name) {
				setAttributes({ name: sanitizedName });
			}
		}
	}, []);

	useEffect(() => {
		// setConditionField(
		// 	wp.data
		// 		.select("core/block-editor")
		// 		.getBlockContext("mediweb/form/row/conditionField")
		// );
		// setConditionValue(
		// 	wp.data
		// 		.select("core/block-editor")
		// 		.getBlockContext("mediweb/form/row/conditionValue")
		// );

		if (isConditional) {
			setAttributes({ conditionField: name });
		} else {
			// setAttributes({ conditionField: "", conditionValue: "" });
			setAttributes({ conditionField: "" });
		}
	}, [isConditional, name]);

	console.log("FIELD OPTIONS", { options });

	// useEffect(() => {
	// 	if (type === "textarea" && textareaRef.current) {
	// 		const { textareaInput } = attributes;
	// 		if (textareaInput && textareaInput.height) {
	// 			textareaRef.current.style.height = `${textareaInput.height}px`;
	// 		}
	// 	}
	// }, [type, attributes]);

	// const onTextareaResize = (e) => {
	// 	console.log("resize event", { e });
	// 	const height = e.target.scrollHeight;
	// 	const textareaInput = {
	// 		...attributes.textareaInput,
	// 		height: height,
	// 	};

	// 	console.log({ textareaInput });
	// 	setAttributes({ textareaInput });
	// };

	useEffect(() => {
		if (type === "textarea") {
			console.warn("Effect 0 on textarea resize", textareaRef);

			setTimeout(() => {
				console.log("timeout 1000");
				console.warn("Effect on textarea resize", textareaRef);

				if (textareaRef.current) {
					const textarea = textareaRef.current;

					if (window.ResizeObserver) {
						resizeObserverRef.current = new ResizeObserver((entries) => {
							for (let entry of entries) {
								// const height = entry.contentRect.height; //without paddings
								const height =
									entry.borderBoxSize?.[0]?.blockSize ||
									entry.contentRect.height;
								console.log({ entry });

								console.warn("Textarea resized to:", height);

								setTextareaInput((prev) => ({
									...prev,
									height: height,
								}));

								// setAttributes({
								// 	textareaInput: {
								// 		...attributes.textareaInput,
								// 		height: height,
								// 	},
								// });
							}
						});

						resizeObserverRef.current.observe(textarea);
					}
				}
			}, 1000);
		}

		return () => {
			console.warn("_____________UNMOUNT_____________");
			if (resizeObserverRef.current && textareaRef.current) {
				resizeObserverRef.current.unobserve(textareaRef.current);
			}
		};
	}, [type, textareaInput]);

	useEffect(() => {
		return () => {
			console.warn("_____________UNMOUNT_____________");

			setAttributes({ textareaInput: textareaInput });
		};
	}, [textareaInput]);

	const fieldProps = useMemo(() => {
		let props = {};

		switch (type) {
			case "textarea":
				props.textareaRef = textareaRef;
				// props.onTextareaResize = onTextareaResize;
				break;
			case "checkbox":
			case "radio":
				props = {
					onChange: handleOptionValue,
					onRemoveOption: handleRemoveOption,
					onChange: setAttributes,
					onSortEnd: onSortEnd,
					onExtraInputLabelChange: handleExtraInputLabelChange,
					onOptionChange,
				};
				break;

			default:
				break;
		}

		return props;
	}, [
		type,
		handleOptionValue,
		handleRemoveOption,
		setAttributes,
		onSortEnd,
		handleExtraInputLabelChange,
		onOptionChange,
	]);

	return (
		<div {...blockProps}>
			<BlockControls>
				{["radio", "checkbox"].includes(type) && (
					<Toolbar>
						<ToolbarItem>
							{(toolbarItemProps) => (
								<Button
									onClick={() =>
										setAttributes({
											options: [
												...options,
												{
													key: `option-${options.length + 1}`,
													value: "Option %N%",
												},
											],
										})
									}
								>
									+
								</Button>
							)}
						</ToolbarItem>
					</Toolbar>
				)}
			</BlockControls>
			<InspectorControls>
				<PanelBody initialOpen={true} title="Field settings">
					<PanelRow>
						<CheckboxControl
							label={__("Highlight this field", "mediweb")}
							checked={attributes.highlighted}
							onChange={(highlighted) => setAttributes({ highlighted })}
						/>
					</PanelRow>
					<PanelRow>
						<CheckboxControl
							label="Required"
							checked={required}
							onChange={() => setAttributes({ required: !required })}
						/>
					</PanelRow>
					<PanelRow>
						<CheckboxControl
							label="Inline"
							checked={inline}
							onChange={() => setAttributes({ inline: !inline })}
						/>
					</PanelRow>
					<PanelRow>
						<NumberControl
							onChange={(w) => setAttributes({ width: +w })}
							prefix={<InputControlPrefixWrapper>%</InputControlPrefixWrapper>}
							isDragEnabled
							isShiftStepEnabled
							shiftStep={1}
							step={1}
							value={width}
						/>
					</PanelRow>
					{!["radio", "checkbox"].includes(type) && (
						<PanelRow>
							<TextControl
								label="Field placeholder"
								value={placeholder}
								onChange={(placeholder) => setAttributes({ placeholder })}
								type="text"
							/>
						</PanelRow>
					)}
					<PanelRow>
						<TextControl
							label="Field name"
							value={name}
							onChange={(name) => {
								// sanitize name: lowercase, replace spaces with dashes, remove special characters except dashes and underscores
								let sanitizedName = sanitizeInputName(name);

								setAttributes({ name: sanitizedName });
							}}
							type="text"
						/>
					</PanelRow>
					<PanelRow>
						<div>
							<CustomSelectControl
								label="Field Type"
								options={FIELD_TYPE_OPTIONS}
								onChange={({ selectedItem }) =>
									setAttributes({ type: selectedItem.key })
								}
								value={FIELD_TYPE_OPTIONS.find((option) => option.key === type)}
							/>
							{["radio", "checkbox", "dropdown"].includes(type) && (
								<div>
									<p></p>
									<CheckboxControl
										label="Is conditional"
										checked={isConditional}
										onChange={() =>
											setAttributes({ isConditional: !isConditional })
										}
									/>
								</div>
							)}
							<ConditionalSettings
								attributes={attributes}
								setAttributes={setAttributes}
								context={context}
							/>
						</div>
					</PanelRow>
				</PanelBody>

				{["radio", "checkbox"].includes(type) && (
					<CheckboxSettings
						setAttributes={setAttributes}
						attributes={attributes}
					/>
				)}

				{type === "dropdown" && (
					<DropdownSettings
						setAttributes={setAttributes}
						attributes={attributes}
					/>
				)}

				{type === "date" && (
					<DateSettings setAttributes={setAttributes} attributes={attributes} />
				)}

				{type === "file" && (
					<UploadSettings
						setAttributes={setAttributes}
						attributes={attributes}
					/>
				)}
			</InspectorControls>

			<FieldWrapperTag type={type}>
				<>
					<RichText
						tagName="span"
						placeholder={__("Field label...", "mediweb")}
						value={label}
						onChange={(label) => setAttributes({ label })}
					/>
					<div className="input-wrapper">
						<Suspense fallback={<div>Loading field...</div>}>
							{FieldComponent && (
								<FieldComponent {...fieldProps} {...attributes} />
							)}
						</Suspense>
						{/* {Field[type](attributes)} */}
					</div>
				</>
			</FieldWrapperTag>

			{isConditional && (
				<InnerBlocks
					allowedBlocks={["mediweb/form-row"]}
					template={[["mediweb/form-row"]]}
				/>
			)}
		</div>
	);
}
