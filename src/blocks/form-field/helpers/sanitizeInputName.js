// Helper function to sanitize input names
export const sanitizeInputName = (name) => {
	//Rewrite in such way to remove accents and special characters
	name = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	// Then convert to lowercase, replace spaces with dashes, and remove special characters except dashes and underscores

	let sanitizedName = name
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-_]/g, "");
	return sanitizedName;
};

export default sanitizeInputName;
