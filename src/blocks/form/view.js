import React, { useState } from "react";
// import ReactDOM from "react-dom";

import DatePicker from "react-datepicker";
import { fr } from "date-fns/locale";
import { conditionalFields } from "./formControls/conditionalFields";
import { setupInputFileControls } from "./formControls/inputFile";
import { formValidation } from "./formControls/formValidation";
// import "react-datepicker/dist/react-datepicker.css";

console.log("FORM Script");

const DatePickerComponent = ({ initialDate, name, onDateChange }) => {
	const [selectedDate, setSelectedDate] = useState(initialDate);

	const handleChange = (date) => {
		setSelectedDate(date);
		onDateChange(date); // Call the parent function to update the date
	};

	return (
		<DatePicker
			selected={selectedDate}
			onChange={handleChange}
			dateFormat="dd-MM-yyyy"
			placeholderText="JJ-MM-AAAA"
			name={name}
			locale={fr}
		/>
	);
};

document.addEventListener("DOMContentLoaded", () => {
	const forms = document.querySelectorAll(".m-form");

	// Dropdown fields enhancement with Choices.js
	if (typeof Choices !== "undefined") {
		let choices = [];

		document.querySelectorAll(".m-form select")?.forEach((slct) => {
			let slctWrap = slct.closest(".field-dropdown");
			// let customPlaceholderElement = slctWrap && slctWrap.nextElementSibling;
			let customPlaceholderElement =
				slctWrap && slctWrap.querySelector(".select-placeholder");
			console.log({ customPlaceholderElement, slctWrap });
			let customPlaceholder =
				customPlaceholderElement?.dataset?.selectPlaceholder ||
				"Sélectionnez votre praticien *";

			// Check if this is a multiple select
			const isMultiple = slct.hasAttribute("multiple");

			let choicesConfig = {
				searchEnabled: false,
				placeholder: true,
				placeholderValue: customPlaceholder,
				searchPlaceholderValue: customPlaceholder,
				paste: false,
				itemSelectText: "",
				shouldSort: false,
			};

			if (isMultiple) {
				choicesConfig = {
					...choicesConfig,
					addItems: false,
					// removeItems: false,
					removeItemButton: true,
					// renderSelectedChoices: "always", // not remove selected option from dropdown
					duplicateItemsAllowed: false,
				};
			}

			let choice = new Choices(slct, choicesConfig);

			// if (isMultiple) {
			// 	choice.setChoices([
			// 		{ value: "", label: customPlaceholder, disabled: true },
			// 		{ value: "test 2", label: "test 2", disabled: false },
			// 		{
			// 			value: "test 3",
			// 			label: "test 3",
			// 			disabled: false,
			// 			onclick: () => console.log("test 3 clicked"),
			// 		},
			// 	]);
			// }

			// slct.addEventListener("highlightItem", (event) => {
			// 	console.log("highlightItem", { event });
			// });
			// slct.addEventListener("choice", (event) => {
			// 	console.log("choice", { event });
			// });
			// slct.addEventListener("change", (event) => {
			// 	console.log("change", { event });
			// });

			slct["_choices"] = choice;

			choices.push(choice);
		});
	}

	// Handle tel inputs
	const telInputs = document.querySelectorAll(".m-form input[type='tel']");

	telInputs?.forEach((tel) => {
		tel.maxLength = 11;
		tel.setAttribute("maxlength", "11");

		tel.addEventListener("input", (e) => {
			let sanitizedInput;
			// console.log(tel.value, tel.value.length);

			if (tel.value.length === 1) {
				sanitizedInput = tel.value.replace(/[^0-9+]/g, "");
			} else if (tel.value.length > 1 || tel.value.length === 0) {
				sanitizedInput = tel.value.replace(/[^0-9]/g, "");

				const plusCharAtBegin = tel.value.charAt(0) === "+";

				if (plusCharAtBegin) {
					sanitizedInput = "+" + sanitizedInput;
				}
			}

			// Update the input value with the sanitized version
			tel.value = sanitizedInput;
		});
	});

	forms.forEach((form) => handleForm(form));
});

function getModalTemplate(message) {
	return `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <p class="title">${message}</p>
        </div>
    `;
}

function handleForm(form) {
	if (!form) return;

	form.addEventListener("submit", async (e) => {
		let that = e.currentTarget;
		that.classList.add("loading");
		e.preventDefault();

		// const isValid = handleCheckboxRequired(form, e);
		// console.log({ isValid });

		const formValidationResponse = formValidation(form);

		console.warn({ formValidationResponse });

		// if (formValidationResponse.isValid === false) {
		if (formValidationResponse?.errorFields?.length > 0) {
			formValidationResponse.errorFields[0]?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
			that.classList.remove("loading");
			return;
		}

		const data = new FormData(that);
		data.append("action", "mediweb_form_submit");
		data.append("security", ajax.nonce);

		// mutate date format to DD-MM-YYYY
		let date = data.get("date");
		console.log("if exist", { date });

		if (date) {
			const formattedDate = handleDefaultDateFormat(date);
			console.log({ formattedDate });

			if (formattedDate) {
				data.set("date", formattedDate);
			}
		}

		console.log({ date: data.get("date") });

		console.log({ inputSettings: data.getAll("inputSettings[]") });

		// Handle conditional fields order
		// let parsedSettings = data.getAll("inputSettings[]").map((field) => {
		// 	try {
		// 		return JSON.parse(field);
		// 	} catch (error) {
		// 		return null;
		// 	}
		// });

		// console.log({ parsedSettings });

		// Step 2: Create a map for quick access to objects by name
		// const nameMap = new Map(parsedSettings.map((item) => [item.name, item]));
		// const nameMap = new Map(
		// 	parsedSettings.reduce((acc, item) => {
		// 		console.log({ item });

		// 		if (item) {
		// 			acc.push([item.name, item]);
		// 		}
		// 		return acc;
		// 	}, [])
		// );

		// console.log({ nameMap });

		// parsedSettings = parsedSettings.filter(Boolean); // Remove nulls
		// console.log({ parsedSettings });

		// Step 3: Sort the array
		// const sortedSettings = [];
		// const conditionObjects = {};

		// Iterate through the parsed settings
		// parsedSettings.forEach((item) => {
		// 	// If it has a context_conditionField, store it separately
		// 	if (item.context_conditionField) {
		// 		if (!conditionObjects[item.context_conditionField]) {
		// 			conditionObjects[item.context_conditionField] = [];
		// 		}

		// 		conditionObjects[item.context_conditionField].push(item);
		// 	} else {
		// 		// Push the origin object to the sorted array
		// 		sortedSettings.push(item);
		// 	}
		// });

		// Now, insert condition objects right after their corresponding origin objects
		// conditionObjects.forEach((conditionObject) => {
		// 	const originName = conditionObject.context_conditionField;
		// 	const originObject = nameMap.get(originName);

		// 	// Find the index of the origin object in the sorted array
		// 	const index = sortedSettings.indexOf(originObject);
		// 	if (index !== -1) {
		// 		// Insert the condition object right after the origin object
		// 		sortedSettings.splice(index + 1, 0, conditionObject);
		// 	}
		// });

		// Now, insert condition objects right after their corresponding origin objects
		// (conditionObjects is an object: { originName: [item, item, ...], ... })
		// for (let i = 0; i < sortedSettings.length; i++) {
		// 	const origin = sortedSettings[i];
		// 	const group = conditionObjects[origin.name];
		// 	if (group && group.length) {
		// 		// insert group's items preserving their saved order
		// 		sortedSettings.splice(i + 1, 0, ...group);
		// 		i += group.length; // skip over inserted items
		// 	}
		// }

		// console.log({ sortedSettings, conditionObjects });

		// Step 4: Convert back to JSON strings if needed
		// const finalSortedSettings = sortedSettings.map((item) =>
		// 	JSON.stringify(item)
		// );

		// return;

		// console.log({ finalSortedSettings });

		// data.set("inputSettings[]", finalSortedSettings);
		// data.delete("inputSettings[]");

		// finalSortedSettings.forEach((setting) => {
		// 	data.append("inputSettings[]", setting); // Correctly append each setting
		// });

		const req = await fetch(ajax.url, {
			method: "POST",
			// headers: {
			// 	"Content-Type": "xxx/url-form-encoded",
			// },
			body: data,
		});

		const res = await req.json();
		console.log({ res });

		that.classList.remove("loading");

		if (!res.success) {
			const modal = document.createElement("div");
			modal.classList.add("modal");
			modal.innerHTML = getModalTemplate(i18n.formSubmitFailed);
			document.body.appendChild(modal);

			const closeButton = modal.querySelector(".close-button");

			closeButton.addEventListener("click", () => {
				modal.remove();
			});

			modal.addEventListener("click", (e) => {
				if (e.target === modal) {
					modal.remove();
				}
			});
		}

		if (res.success) {
			// form.reset();
			// Handle success
			//Create a modal with text that says "Form submitted successfully" but  with i18n
			// also add button to close the modal or close via click out of the modal
			const modal = document.createElement("div");
			modal.classList.add("modal");
			modal.innerHTML = getModalTemplate(i18n.formSubmitted);
			document.body.appendChild(modal);

			const closeButton = modal.querySelector(".close-button");

			closeButton.addEventListener("click", () => {
				modal.remove();
			});

			modal.addEventListener("click", (e) => {
				if (e.target === modal) {
					modal.remove();
				}
			});
		}
	});

	// Datepicker fields enhancement with react-datepicker
	const dateInputs = form.querySelectorAll(
		'input[type="date"], input[data-type="mask"]'
	);

	function updateDateInput({ currentTarget: input }) {
		// use value presence to determine state
		if (input.value && input.value.trim() !== "") {
			input.classList.add("has-value");
		} else {
			input.classList.remove("has-value");
		}
	}

	dateInputs.forEach((input) => {
		// initial state
		updateDateInput({ currentTarget: input });
		// update on user input/change (cover different browsers)
		input.addEventListener("input", updateDateInput);
		input.addEventListener("change", updateDateInput);

		const dateFieldType = input.dataset?.type || null;

		if (dateFieldType === "mask") {
			// user-friendly numeric input
			input.maxLength = 10;
			input.inputMode = "numeric";
			input.autocomplete = "off";

			const applyMask = (raw) => {
				const digits = (raw || "").replace(/\D/g, "").slice(0, 8); // ddmmyyyy
				if (!digits) return "";
				const d = digits.slice(0, 2);
				const m = digits.length > 2 ? digits.slice(2, 4) : "";
				const y = digits.length > 4 ? digits.slice(4) : "";
				return [d, m, y].filter(Boolean).join("/");
			};

			const isValidFullDate = (masked) => {
				if (!masked || masked.length !== 10) return false;
				const [dd, mm, yyyy] = masked.split("-").map((s) => parseInt(s, 10));
				if (!dd || !mm || !yyyy) return false;
				const dt = new Date(yyyy, mm - 1, dd);
				return (
					dt.getFullYear() === yyyy &&
					dt.getMonth() + 1 === mm &&
					dt.getDate() === dd
				);
			};
			// keep caret reasonably positioned when formatting
			const preserveCursor = (el, oldValue, newValue, oldPos) => {
				// calculate new position by counting digits before oldPos
				const digitsBefore = oldValue
					.slice(0, oldPos)
					.replace(/\D/g, "").length;
				if (digitsBefore === 0) {
					el.setSelectionRange(0, 0);
					return;
				}
				// find position in newValue after same number of digits
				let pos = 0,
					count = 0;
				while (pos < newValue.length && count < digitsBefore) {
					if (/\d/.test(newValue[pos])) count++;
					pos++;
				}
				el.setSelectionRange(pos, pos);
			};

			const onInputMasked = (e) => {
				const old = input.value;
				const oldPos = input.selectionStart || 0;
				const newVal = applyMask(old);
				input.value = newVal;
				preserveCursor(input, old, newVal, oldPos);
				updateDateInput({ currentTarget: input });
			};

			input.addEventListener("input", onInputMasked);

			input.addEventListener("paste", (e) => {
				e.preventDefault();
				const text = (e.clipboardData || window.clipboardData).getData("text");
				input.value = applyMask(text);
				input.dispatchEvent(new Event("input", { bubbles: true }));
			});

			input.addEventListener("blur", () => {
				if (input.value.trim() === "") return;
				if (!isValidFullDate(input.value)) {
					input.classList.add("invalid"); // style .invalid in CSS
				} else {
					input.classList.remove("invalid");
					// ensure final normalized format (already dd-mm-yyyy)
					input.value = applyMask(input.value);
				}
			});
		}
	});

	// TODO: Temp disable datepicker
	// dateInputs.forEach((input) => {
	// 	const initialDate = input.value ? new Date(input.value) : null;
	// 	const name = input.name;

	// 	// console.log({ input });

	// 	// Create a wrapper div for the React component
	// 	const datePickerWrapper = document.createElement("div");
	// 	datePickerWrapper.classList.add("field-date");
	// 	input.parentNode.replaceChild(datePickerWrapper, input); // Replace the input with the wrapper

	// 	// Render the DatePickerComponent
	// 	ReactDOM.render(
	// 		<DatePickerComponent
	// 			initialDate={initialDate}
	// 			name={name}
	// 			onDateChange={(date) => {
	// 				console.log({ date });
	// 				input.value = date ? date.toISOString().split("T")[0] : ""; // Update the input value
	// 			}}
	// 		/>,
	// 		datePickerWrapper
	// 	);
	// });

	// Handle Conditional fields

	setupInputFileControls(form);

	conditionalFields(form);

	// END
}

function handleCheckboxRequired(form, formEvent) {
	if (!form) return;
	console.log("Handle Checkboxes");

	let isValid = true;

	// Validate required checkbox groups
	const requiredCheckboxGroups = form.querySelectorAll(
		".checkbox-group.required"
	);

	requiredCheckboxGroups.forEach((group) => {
		const groupName = group.querySelector('input[type="checkbox"]')?.name;
		if (groupName) {
			const baseName = groupName.replace("[]", "");
			const checkedBoxes = group.querySelectorAll(
				`input[name="${baseName}[]"]:checked`
			);

			if (checkedBoxes.length === 0) {
				isValid = false;
				group.classList.add("has-error");

				// // Add error message if not exists
				// if (!group.querySelector(".error-message")) {
				// 	const errorMsg = document.createElement("span");
				// 	errorMsg.className = "error-message";
				// 	errorMsg.textContent = "Please select at least one option";
				// 	group.appendChild(errorMsg);
				// }
			} else {
				group.classList.remove("has-error");
				// Remove error message
				// const errorMsg = group.querySelector(".error-message");
				// if (errorMsg) {
				// 	errorMsg.remove();
				// }
			}
		}
	});

	console.log({ isValid });

	if (!isValid) {
		formEvent.preventDefault();
		// Scroll to first error
		const firstError = form.querySelector(".has-error");
		if (firstError) {
			firstError.scrollIntoView({ behavior: "smooth", block: "center" });
		}

		return false;
	}
}

const handleDefaultDateFormat = (date) => {
	if (!date) return null;

	let copyDate = new Date(date);
	if (isNaN(copyDate)) return null; // Invalid date check

	const day = String(copyDate.getDate()).padStart(2, "0"); // Get day and pad with zero if needed
	const month = String(copyDate.getMonth() + 1).padStart(2, "0"); // Get month (0-indexed) and pad
	const year = copyDate.getFullYear(); // Get full year
	return `${day}-${month}-${year}`; // Return formatted date
};

// function collectFormHTML(form) {
// 	const formClone = form.cloneNode(true);
// 	const fd = new FormData(formClone);
// 	const settings = fd
// 		.getAll("inputSettings[]")
// 		.map((s) => {
// 			try {
// 				return JSON.parse(s);
// 			} catch (error) {
// 				console.error("Error parsing inputSettings:", error);
// 				return null;
// 			}
// 		})
// 		.filter(Boolean);

// 	console.log({ settings });

// 	let markup = "";

// 	// Clean up the clone - remove form controls but keep structure
// 	formClone.querySelectorAll(".m-form__row").forEach((row) => {
// 		const fields = row.querySelectorAll(".m-form__field");
// 		let rowMarkup = "";

// 		fields.forEach((field) => {
// 			const fieldName = field.querySelector("input, select, textarea")?.name;
// 			console.log({ fieldName });
// 			const label = settings.find((s) => s.name === fieldName)?.label || "___";
// 			rowMarkup += `<div class="m-form__field"><label>${label}</label></div>`;
// 			// field.innerHTML = "";
// 			const val = fd.getAll(fieldName)?.join(", ");

// 			field.innerHTML = `<div class="m-form__field"><label>${label}</label>${val}</div>`;
// 		});

// 		if (rowMarkup) {
// 			// markup += `<div class="m-form__row">${rowMarkup}</div>`;
// 			markup += row.innerHTML;
// 		}

// 		// row.innerHTML = "";
// 	});

// 	// return formClone.innerHTML;

// 	return markup;
// }

// window.collectFormHTML = collectFormHTML;
