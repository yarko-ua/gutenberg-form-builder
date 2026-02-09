export const loadFieldComponent = (type) => {
	switch (type) {
		case "text":
			return import("../field/FieldText");
		case "number":
			return import("../field/FieldNumber");
		case "tel":
			return import("../field/FieldTel");
		case "date":
			return import("../field/FieldDate");
		case "radio":
			return import("../field/FieldRadio");
		case "checkbox":
			return import("../field/FieldCheckbox");
		case "dropdown":
			return import("../field/FieldDropdown");
		case "file":
			return import("../field/FieldUpload");
		case "textarea":
			return import("../field/FieldTextarea");
		default:
			return Promise.resolve(() => null); // fallback
	}
};
