// import { i } from "motion/react-client"; // Removed - not needed for validation

export const formValidation = (form) => {
	if (!form) return true;

	const fd = new FormData(form);
	const inputSettings =
		fd
			.getAll("inputSettings[]")
			?.filter(Boolean)
			?.map((item) => JSON.parse(item)) || [];

	let isValid = true;
	const errorFields = [];

	inputSettings.forEach((inputSetting) => {
		const {
			name,
			label,
			required,
			context_conditionField,
			context_conditionValue,
			conditionValue,
			isMultiple,
		} = inputSetting;
		let isFieldValid = true;

		console.log({ inputSetting });

		const correctInputName = isMultiple ? `${name}[]` : name;

		console.log({ correctInputName, name });

		const fieldElement = form
			.querySelector(`[name="${correctInputName}"]`)
			?.closest(".m-form__field");

		if (required) {
			let value = fd.get(correctInputName);

			if (value instanceof File) {
				value = !value.size && null;
			}

			console.log({ value });

			// Check for conditional logic
			if (context_conditionField) {
				const conditionFieldValue = fd.get(context_conditionField);
				console.log({
					conditionFieldValue,
					context_conditionValue,
					conditionValue,
					value,
				});

				console.warn("isInvalid", {
					viaConditionValue: !!conditionValue && conditionValue !== value,
					viaContextConditionValue:
						!!context_conditionValue &&
						context_conditionValue === conditionFieldValue &&
						!value,
					value,
					conditionValue: `${conditionValue} is ${!!conditionValue}`,
					context_conditionValue: `${context_conditionValue} is ${!!context_conditionValue}`,
					conditionFieldValue,
				});

				if (!conditionFieldValue) {
					// Skip validation if the condition is not met
					isValid = true;
					isFieldValid = true;
					// return;
				}

				if (
					(!!conditionValue && conditionValue !== value) ||
					(!!context_conditionValue &&
						context_conditionValue === conditionFieldValue &&
						!value)
				) {
					isValid = false;
					isFieldValid = false;
					// return;
				}
			} else if (value === null || value.trim() === "") {
				isValid = false;
				isFieldValid = false;
				// return;
			}
		}

		console.log({ isFieldValid, fieldElement });

		if (!isFieldValid) {
			if (fieldElement) {
				fieldElement.classList.add("has-error");
				errorFields.push(fieldElement);
			}
		} else {
			if (fieldElement) {
				fieldElement.classList.remove("has-error");
			}
		}
	});

	return { isValid, inputSettings, errorFields };
};
