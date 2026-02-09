import { __ } from "@wordpress/i18n";
import {
	InspectorControls,
	LinkControl,
	RichText,
} from "@wordpress/block-editor";
import { PanelBody } from "@wordpress/components";

import "./styles.scss";

export default function Button({ link, onChange }) {
	return (
		<>
			<InspectorControls>
				{/* Add your controls here */}
				<PanelBody title="Button Settings">
					<LinkControl
						searchInputPlaceholder="Search here..."
						value={link}
						settings={[
							{
								id: "opensInNewTab",
								title: "New tab?",
							},
							{
								id: "customDifferentSetting",
								title: "Has this custom setting?",
							},
						]}
						onChange={(newPost) => console.log("button", { newPost })}
						withCreateSuggestion={true}
						createSuggestion={(inputValue) => {}}
						createSuggestionButtonText={(newValue) =>
							`${__("New:")} ${newValue}`
						}
					></LinkControl>
				</PanelBody>
			</InspectorControls>

			<RichText
				tagName="button"
				className="m-button"
				value={link?.title}
				onChange={(newTitle) => console.log({ newTitle })}
				placeholder="Button text"
			/>
		</>
	);
}
