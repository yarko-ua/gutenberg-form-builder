import { useState } from "@wordpress/element";
// import DatePicker from "react-datepicker";

// import "react-datepicker/dist/react-datepicker.css";

export default function FieldDate({
	name,
	placeholder = "JJ-MM-AAAA",
	required,
	mode,
	dateInput,
}) {
	// const [selectedDate, setSelectedDate] = useState(new Date());
	const options = {};

	if (mode !== "render") {
		options.readOnly = true;
		options.disabled = true;
	}

	if (dateInput?.type === "mask") {
		return (
			<input
				type="text"
				// required={required}
				name={name}
				{...options}
				data-inputmask="'mask': '14-10-2020'"
				data-type={dateInput?.type}
				placeholder={placeholder}
			/>
		);
	}

	return (
		<input
			type="date"
			// placeholder={placeholder}
			required={required}
			name={name}
			{...options}
		/>
	);
}
