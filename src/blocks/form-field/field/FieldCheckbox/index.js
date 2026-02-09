import { RichText } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import clsx from "clsx";

const SortableRadioCheckboxOption = SortableElement(
	({ option, index, onOptionChange, onRemove }) => {
		console.log({ index, option });
		const handleOption = onOptionChange; //.bind(null, index);

		return (
			<div className="group-item sortable-item">
				<label>
					<input
						type="checkbox"
						name="def"
						value={option.value}
						readOnly
						disabled
					/>

					<RichText
						tagName="span"
						value={option.value}
						onChange={handleOption}
						placeholder="Option value"
					/>
				</label>
			</div>
		);
	}
);

const SortableRadioCheckbox = SortableContainer(
	({ options, onRemove, onOptionChange }) => (
		<div className="checkbox-group sortable-group">
			{options.map((option, index) => (
				<SortableRadioCheckboxOption
					key={index}
					index={index}
					option={option}
					onRemove={onRemove}
					onOptionChange={onOptionChange.bind(null, options, index)}
				/>
			))}
		</div>
	)
);

export default function FieldCheckbox({
	name,
	required,
	options = [],
	mode = "default",
	onOptionChange = (options, i, value) => {
		console.log({ options, i, value });
	},
	onRemoveOption = () => {},
	onSortEnd = () => {},
	onChange = () => {},
	onExtraInputLabelChange = (options, i, value) => {},
}) {
	const inputOptions = {};

	console.log("Checkbox options:", { options });

	if (mode !== "render") {
		inputOptions.readOnly = true;
		inputOptions.disabled = true;
	}

	if (required && options.length <= 1) {
		// inputOptions.required = true;
	}

	// if (mode === "default") {
	// 	return (
	// 		<SortableRadioCheckbox
	// 			options={options}
	// 			onRemove={onRemoveOption}
	// 			onOptionChange={onOptionChange}
	// 			onChange={onChange}
	// 			onSortEnd={onSortEnd}
	// 			axis="x"
	// 		/>
	// 	);
	// }

	return (
		<>
			{required && options.length > 1 && (
				<div className="error-message">
					{__(
						"Veuillez sélectionner au moins une option.",
						"mediweb-gutenberg"
					)}
				</div>
			)}
			<div className={clsx("checkbox-group", { required })}>
				{options.map((option, i) => {
					const handleOptionChange = onOptionChange.bind(null, options, i);
					const handleExtraInputLabelChange = onExtraInputLabelChange.bind(
						null,
						options,
						i
					);

					return (
						<div className="group-item" key={i}>
							<label>
								<input
									type="checkbox"
									name={`${name}[]`}
									value={option.value}
									{...inputOptions}
								/>
								{mode === "default" ? (
									<RichText
										tagName="span"
										value={option.value}
										onChange={handleOptionChange}
										placeholder="Option value"
									/>
								) : (
									<span>{option.value}</span>
								)}
							</label>
							{option.extraInput && typeof option.extraInput === "object" && (
								<div className="m-form__field wp-block-mediweb-form-field">
									<div className="field-wrapper">
										{mode === "default" ? (
											<RichText
												tagName="span"
												placeholder="Label for extra input.."
												value={option.extraInput.label}
												onChange={handleExtraInputLabelChange}
											/>
										) : (
											<span>{option.extraInput.label}</span>
										)}

										<div className="input-wrapper">
											<input
												type="text"
												name={`${option.extraInput.name}`}
												placeholder=" "
												{...(mode !== "render" && {
													readOnly: true,
													disabled: true,
												})}
											/>
										</div>
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</>
	);
}
