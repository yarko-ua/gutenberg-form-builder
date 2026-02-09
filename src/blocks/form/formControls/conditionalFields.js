//Here we handle the conditional fields display logic

export const conditionalFields = (form) => {
	console.log("Condiional fields logic init..");

	const formRows = form.querySelectorAll(".m-form__row.is-conditional");

	formRows.forEach((row) => {
		const conditionField = row.dataset.conditionField;
		const conditionValue = row.dataset.conditionValue;

		// Subscribe on the condition field change
		const targetField = form.querySelector(`[name^="${conditionField}"]`);

		// console.log({ targetField });
		if (!targetField) return;

		const isTargetFieldMultiple =
			targetField.type === "checkbox" || targetField.type === "select-multiple";

		// console.log({ isTargetFieldMultiple });

		const conditionalFieldsMap = new Map();
		const handleRow = conditionValue !== "";

		// console.log({ handleRow });

		if (!handleRow) {
			// row.style.display = "flex";
			row.classList.add("is-active");

			// row is available, but control separatlye each condiional field inside the row
			const conditionalFields = row.querySelectorAll(
				".m-form__field.is-conditional"
			);

			conditionalFields.forEach((field) => {
				const fieldConditionValue = field.dataset.conditionValue,
					fieldConditionField = field.dataset.conditionField,
					fieldName = field.dataset.fieldName;

				conditionalFieldsMap.set(field, {
					fieldConditionValue,
					trackField: fieldConditionField,
					fieldName: fieldName,
				});
			});
		}

		// console.log({ conditionalFieldsMap });

		// Subscribe on form data change
		form.addEventListener("change", (e) => {
			const formData = new FormData(form);
			// console.log({ formData });

			const conditionFieldNamekey = isTargetFieldMultiple
				? `${conditionField}[]`
				: conditionField;

			const fieldValues = formData.getAll(conditionFieldNamekey); // Get all values for the condition field (for checkboxes)

			console.log({ fieldValues, handleRow, row });

			if (handleRow) {
				if (fieldValues.includes(conditionValue)) {
					// row.style.display = "flex";
					row.classList.add("is-active");
				} else {
					// row.style.display = "none";
					row.classList.remove("is-active");
				}
			} else {
				// Handle conditional fields inside the row
				// console.log("Handle Fields:");
				conditionalFieldsMap.forEach((value, field) => {
					const conditionFieldNamekey = isTargetFieldMultiple
						? `${value.trackField}[]`
						: value.trackField;

					const fieldValues = formData.getAll(conditionFieldNamekey); // Get all values for the condition field (for checkboxes)

					console.log({
						conditionFieldNamekey,
						isTargetFieldMultiple,
						field,
						value,
						fieldValues,
					});
					// console.log({ value, field });

					if (fieldValues.includes(value.fieldConditionValue)) {
						field.classList.add("is-active");
					} else {
						field.classList.remove("is-active");
						formData.delete(`${value.fieldName}[]`);
						// if field contains checboxes/radio, uncheck them
						const inputs = field.querySelectorAll("input, select, textarea");
						inputs.forEach((input) => {
							if (input.type === "checkbox" || input.type === "radio") {
								input.checked = false;
							} else {
								input.value = "";
							}
						});
					}
				});
			}
		});
	});
};
