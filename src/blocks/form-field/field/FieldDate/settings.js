import { SelectControl } from "@wordpress/components";
import { CustomSelectControl } from "@wordpress/components";
import {
	PanelBody,
	PanelRow,
	__experimentalNumberControl as NumberControl,
	Button,
	TextControl,
} from "@wordpress/components";

const FIELD_DATE_TYPE_OPTIONS = [
	{ key: "default", name: "Default" },
	{ key: "datepicker", name: "Datepicker" },
	{ key: "mask", name: "Masked Input" },
];

export default function DateSettings({ setAttributes, attributes }) {
	const { type, dateInput } = attributes;

	return (
		<PanelBody title="Date Field Options">
			<PanelRow>
				<CustomSelectControl
					label="Field Type"
					options={FIELD_DATE_TYPE_OPTIONS}
					onChange={({ selectedItem }) =>
						setAttributes({
							dateInput: { ...dateInput, type: selectedItem.key },
						})
					}
					value={FIELD_DATE_TYPE_OPTIONS.find(
						(option) => option.key === dateInput.type
					)}
				/>
			</PanelRow>
		</PanelBody>
	);
}
