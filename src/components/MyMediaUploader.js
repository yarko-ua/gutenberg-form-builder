import { MediaUpload, MediaUploadCheck } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";

import { ToolbarButton } from "@wordpress/components";
import EditImage from "../icons/edit-image.png";
import AddImage from "../icons/add-image.png";

import "./mediaUploader.scss";

const ALLOWED_MEDIA_TYPES = ["image"];

export default function MyMediaUploader({
	onSelect,
	value,
	title = "Pictures",
	multiple = undefined,
	compact,
	children,
}) {
	const onClear = () => {
		const clear = multiple ? [] : null;
		onSelect(clear);
	};

	console.log({ value });

	const mediaValue =
		multiple && Array.isArray(value)
			? value.map((media) => media.id)
			: value?.id;

	return (
		<MediaUploadCheck>
			<MediaUpload
				multiple={multiple}
				onSelect={onSelect}
				allowedTypes={ALLOWED_MEDIA_TYPES}
				value={mediaValue}
				render={({ open }) => (
					<div class="media-wrapper">
						<ToolbarButton className="selectBtn" onClick={open}>
							<img
								src={value ? EditImage : AddImage}
								width={24}
								alt={title}
								title={title}
							/>
						</ToolbarButton>
						{value && (
							<ToolbarButton className="removeBtn" onClick={onClear}>
								X
							</ToolbarButton>
						)}

						{!multiple && value && !compact && (
							<img src={value.url} alt={value.alt} />
						)}

						{((multiple && !value.length) || !value) && !compact && (
							<div className="placeholder">
								{__("Select an image", "mediweb")}
							</div>
						)}
					</div>
				)}
			/>
		</MediaUploadCheck>
	);
}
