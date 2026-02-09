import { SelectControl } from "@wordpress/components";

import "./styles.scss";

export default function SelectableWrapper({
	label,
	onChange,
	options,
	value,
	children,
}) {
	return (
		<div className="selectable-wrapper">
			{children}
			<SelectControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize={true}
				label={label}
				onChange={onChange}
				options={options}
				value={value}
			></SelectControl>
		</div>
	);
}
