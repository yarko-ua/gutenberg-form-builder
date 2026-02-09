import { __ } from "@wordpress/i18n";
import { RichText } from "@wordpress/block-editor";

import clsx from "clsx";

export default function FieldRadio({
	name,
	required,
	options = [],
	mode = "default",
	onChange = (options, i, value) => {
		console.log({ options, i, value });
	},
	onOptionChange = (options, i, value) => {
		console.log({ options, i, value });
	},
}) {
	console.log({ options });

	const inputOptions = {};

	if (mode !== "render") {
		inputOptions.readOnly = true;
		inputOptions.disabled = true;
	}

	console.log({ radiosName: name });

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
			<div className="radio-group">
				{options.map((option, i) => {
					// const handleOptionChange = onChange.bind(null, options, i);
					const handleOptionChange = onOptionChange.bind(null, options, i);

					return (
						<div
							className={clsx("group-item", {
								fullwidth: option.takeFullWidth,
								"is-marked": option.isMarked,
							})}
							key={i}
						>
							<label>
								<input
									key={i}
									type="radio"
									name={name}
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
						</div>
					);
				})}
			</div>
		</>
	);
}
