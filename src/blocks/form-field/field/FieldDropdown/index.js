export default function FieldDropdown({
	name,
	placeholder = "Sélectionnez votre praticien",
	required,
	isMultiple = false,
	options = [],
	mode = "default",
	onOptionChange = (options, i, value) => {
		console.log({ options, i, value });
	},
	onRemoveOption = () => {},
	onSortEnd = () => {},
	onChange = () => {},
}) {
	console.log("Dropdown options", { options });

	const inputOptions = {};

	if (mode !== "render") {
		inputOptions.readOnly = true;
		inputOptions.disabled = true;
	}

	console.log("Dropdown name", { name });

	if (required) {
		placeholder = placeholder + " *";
	}

	const correctName = isMultiple ? `${name}[]` : name;

	return (
		<>
			{/* <InspectorControls>
				<PanelBody title="Dropdown Options">
					<PanelRow>Test control</PanelRow>
				</PanelBody>
			</InspectorControls> */}

			<div className="field-dropdown">
				<select name={correctName} {...inputOptions} multiple={isMultiple}>
					<option value=""></option>
					{options.map((option, i) => {
						return (
							<option key={i} value={option.value}>
								{option.value}
							</option>
						);
					})}
				</select>
				<span
					className="select-placeholder"
					data-select-placeholder={placeholder}
				>
					{mode === "default" ? placeholder : ""}
				</span>
			</div>
		</>
	);
}
