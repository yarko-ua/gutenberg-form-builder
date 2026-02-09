export default function FieldNumber({
	name,
	placeholder = "0",
	required,
	mode,
}) {
	const options = {};

	if (mode !== "render") {
		options.readOnly = true;
	}
	return (
		<input
			type="number"
			// required={required}
			name={name}
			{...options}
			placeholder={placeholder}
		/>
	);
}
