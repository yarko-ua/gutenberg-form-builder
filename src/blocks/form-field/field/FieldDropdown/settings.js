import {
	PanelBody,
	PanelRow,
	__experimentalNumberControl as NumberControl,
	Button,
	TextControl,
} from "@wordpress/components";

import { useCallback } from "@wordpress/element";

import { SortableContainer, SortableElement } from "react-sortable-hoc";
import { arrayMoveMutable } from "array-move";
import { ToggleControl } from "@wordpress/components";

const SortableRadioCheckboxOption = SortableElement(
	({ option, index, onOptionChange, onRemove }) => {
		console.log({ index, option });
		const handleOption = onOptionChange; //.bind(null, index);

		return (
			<div className="sortable-item">
				<div className="group-item-control">
					<TextControl
						type="text"
						value={option.value}
						onChange={handleOption}
					/>
					<Button isDestructive onClick={() => onRemove(index)}>
						X
					</Button>
				</div>
				{/* <div className="drag-handle">Drag&Drop to sort</div> */}
			</div>
		);
	}
);

const SortableRadioCheckbox = SortableContainer(
	({ options, onRemove, onOptionChange }) => (
		<div className="sortable-group">
			<p>Drag&Drop to sort options </p>

			{options.map((option, index) => (
				<SortableRadioCheckboxOption
					key={index}
					index={index}
					option={option}
					onRemove={onRemove}
					onOptionChange={onOptionChange.bind(null, options, index)}
				/>
			))}
		</div>
	)
);

export default function DropdownSettings({ setAttributes, attributes }) {
	const { options, cols, isMultiple } = attributes;

	const handleOptionValue = useCallback((options, i, val) => {
		let newOptions = [...options];
		console.log({ opts: options, opt: newOptions[i], i, val });
		newOptions[i].value = val;
		// newOptions[i] = option;
		setAttributes({ options: newOptions });
	}, []);

	const handleRemoveOption = useCallback(
		(i) => {
			const newOptions = [...options];
			newOptions.splice(i, 1);
			setAttributes({ options: newOptions });
		},
		[options]
	);

	const onSortEnd = ({ oldIndex, newIndex }) => {
		const newOptions = [...options]; // Копіюємо масив
		arrayMoveMutable(newOptions, oldIndex, newIndex); // Змінюємо місця елементів у цьому ж масиві
		setAttributes({ options: newOptions }); // Оновлюємо state
	};

	return (
		<PanelBody title="Dropdown Options">
			{/* TODO: Develop styles and handle multiple selection */}
			<div>
				<ToggleControl
					label="Enable multiple selection"
					checked={isMultiple}
					onChange={(value) => setAttributes({ isMultiple: value })}
				/>
			</div>
			<div>
				<div>
					<SortableRadioCheckbox
						options={options}
						onChange={setAttributes}
						onSortEnd={onSortEnd}
						onRemove={handleRemoveOption}
						onOptionChange={handleOptionValue}
						axis="y"
					/>

					<div>
						<Button
							onClick={() =>
								setAttributes({
									options: [
										...options,
										{
											key: `option-${options.length + 1}`,
											value: "Option %N%",
										},
									],
								})
							}
						>
							Add option
						</Button>
					</div>
				</div>
			</div>
		</PanelBody>
	);
}
