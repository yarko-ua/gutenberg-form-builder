export default function FieldTextarea({
	name = "",
	placeholder = "",
	required,
	rows = 2,
	mode = "default",
	textareaRef = null,
}) {
	const options = {};

	if (mode !== "render") {
		options.readOnly = true;
		options.disabled = true;
	}

	return (
		<textarea
			placeholder={placeholder || " "}
			// required={required}
			name={name}
			rows={rows}
			{...options}
			ref={textareaRef}
		/>
	);
}
