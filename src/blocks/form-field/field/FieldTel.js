export default function FieldTel({
	name,
	placeholder = "+33",
	required,
	mode,
}) {
	const options = {};

	console.log("TEL", { placeholder });

	if (mode !== "render") {
		options.readOnly = true;
		options.disabled = true;
	}
	return (
		<input
			type="tel"
			// required={required}
			name={name}
			placeholder={placeholder}
			{...options}
		/>
	);
}
