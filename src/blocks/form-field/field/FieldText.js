export default function FieldText({
	name = "",
	placeholder = "",
	required,
	mode = "default",
}) {
	const options = {};

	if (mode !== "render") {
		options.readOnly = true;
		options.disabled = true;
	}

	return (
		<input
			type="text"
			placeholder={placeholder || " "}
			// required={required}
			name={name}
			{...options}
		/>
	);
}
