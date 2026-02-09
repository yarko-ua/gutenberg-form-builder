import {
	PanelBody,
	PanelRow,
	__experimentalNumberControl as NumberControl,
	Button,
	TextControl,
	ToggleControl,
} from "@wordpress/components";

import { useCallback } from "@wordpress/element";

import { SortableContainer, SortableElement } from "react-sortable-hoc";
import { arrayMoveMutable } from "array-move";

const SortableRadioCheckboxOption = SortableElement(
	({
		option,
		index,
		onOptionChange,
		onRemove,
		options,
		onChange,
		key,
		groupName,
	}) => {
		console.log({ index, option, groupName });
		const handleOption = onOptionChange; //.bind(null, index);

		const onTakeFullWidthChange = (value) => {
			const newOptions = [...options];
			const targetOption = newOptions.find((opt) => opt.key === option.key);

			targetOption.takeFullWidth = value;

			onChange({ options: newOptions });
		};

		const onMarkedChange = (value) => {
			const newOptions = [...options];
			const targetOption = newOptions.find((opt) => opt.key === option.key);

			targetOption.isMarked = value;

			onChange({ options: newOptions });
		};

		const onAddInput = () => {
			console.log({ options, option, index, key });
			const newOptions = [...options];
			const targetOption = newOptions.find((opt) => opt.key === option.key);
			console.log({ targetOption });

			targetOption.extraInput = {
				label: "",
				name: groupName ? `${groupName}[${option.value}]` : "",
			};

			console.log({ targetOption });

			// newOptions[index].inputs = newOptions[index].inputs || [];
			// newOptions[index].inputs.push({
			// 	key: `input-${newOptions[index].inputs.length + 1}`,
			// 	value: "Input %N%",
			// });

			onChange({ options: newOptions });
		};

		const onRemoveInput = () => {
			console.log({ options, option, index, key });
			const newOptions = [...options];
			const targetOption = newOptions.find((opt) => opt.key === option.key);
			console.log({ targetOption });

			targetOption.extraInput = false;

			console.log({ targetOption });

			// if (!newOptions[index].inputs?.length) return;

			// newOptions[index].inputs.pop();

			onChange({ options: newOptions });
		};

		return (
			<div className="sortable-item">
				<div>
					Extra Input:
					<Button
						variant="secondary"
						onClick={onAddInput}
						disabled={!!option.extraInput}
					>
						Add
					</Button>
					<Button
						variant="secondary"
						onClick={onRemoveInput}
						disabled={!option.extraInput}
					>
						Remove
					</Button>
				</div>
				<div>
					<ToggleControl
						checked={!!option.takeFullWidth}
						onChange={onTakeFullWidthChange}
						label="Take full width"
					/>
				</div>
				<div>
					<ToggleControl
						checked={!!option.isMarked}
						onChange={onMarkedChange}
						label="Marked option"
					/>
				</div>
				<div className="group-item-control">
					<TextControl
						type="text"
						value={option.value}
						onChange={handleOption}
					/>
					<Button isDestructive onClick={onRemove}>
						X
					</Button>
				</div>
				{/* <div className="drag-handle">Drag&Drop to sort</div> */}
			</div>
		);
	}
);

const SortableRadioCheckbox = SortableContainer(
	({ options, onRemove, onOptionChange, onChange, groupName }) => (
		<div className="sortable-group">
			<p>Drag&Drop to sort options </p>

			{options.map((option, index) => (
				<SortableRadioCheckboxOption
					key={index}
					index={index}
					option={option}
					onRemove={onRemove.bind(null, index)}
					onOptionChange={onOptionChange.bind(null, options, index)}
					options={options}
					onChange={onChange}
					groupName={groupName}
				/>
			))}
		</div>
	)
);

export default function CheckboxSettings({ setAttributes, attributes }) {
	const { options, cols, name } = attributes;

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
			console.log({ newOptions: newOptions });
			newOptions.splice(i, 1);
			console.log({ slicedNewOptions: newOptions, i });
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
		<PanelBody title="Checkbox Options">
			<div>
				Columns:
				<NumberControl
					onChange={(cols) => setAttributes({ cols: +cols })}
					isDragEnabled
					isShiftStepEnabled
					shiftStep={1}
					step={1}
					value={cols}
					min={1}
					max={10}
				/>
			</div>
			<p></p>
			<div>
				<div>
					<SortableRadioCheckbox
						options={options}
						onChange={setAttributes}
						onSortEnd={onSortEnd}
						onRemove={handleRemoveOption}
						onOptionChange={handleOptionValue}
						axis="y"
						groupName={name}
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
