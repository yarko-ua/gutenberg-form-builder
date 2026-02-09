import { __ } from "@wordpress/i18n";

import { useState } from "@wordpress/element";

import { ReactComponent as FileIcon } from "./fileIcon.svg";

export default function FieldUpload({
	name,
	placeholder = __(
		"Fichier joint (%allowedTypes%) %maxSize% Maximum",
		"mediweb"
	),
	required,
	mode,
	fileInput = {
		allowedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
		maxSize: 20,
		isMultiple: false,
	},
}) {
	// const [selectedDate, setSelectedDate] = useState(new Date());
	const options = {};

	const dynamicPlaceholder = placeholder
		.replace(
			"%allowedTypes%",
			fileInput.allowedTypes.join(", ").replaceAll(".", "").toLocaleUpperCase()
		)
		.replace("%maxSize%", `${fileInput.maxSize}MB`);

	if (mode !== "render") {
		options.readOnly = true;
		options.disabled = true;
	}

	const correctInputFileName = fileInput.isMultiple ? name + "[]" : name;

	return (
		<div className="upload-wrapper">
			<input
				type="file"
				accept={fileInput.allowedTypes.join(",")}
				// required={required}
				name={correctInputFileName}
				{...options}
				multiple={fileInput.isMultiple}
				max={fileInput.maxSize}
			/>
			<p className="upload-placeholder">
				<span>
					<FileIcon />
				</span>
				<span>{dynamicPlaceholder}</span>
			</p>
			<div className="error-message">
				{__("One or more files exceed the maximum allowed size.", "mediweb")}
			</div>
		</div>
	);
}
