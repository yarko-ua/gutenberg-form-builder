export const setupInputFileControls = (form) => {
	const inputFiles = form.querySelectorAll('.type-file [type="file"]');

	if (!inputFiles?.length) return;

	console.log("Run input files controller", { inputFiles });

	[...inputFiles].forEach((inputFile) => {
		// console.log({ id: inputFile.id, inputFile });
		// const label = document.querySelector(`label[for=${inputFile.id}]`);
		const fileContainer = inputFile.closest(`.type-file`);
		const uploadWrapper = inputFile.closest(`.upload-wrapper`);

		if (!uploadWrapper) return;

		const maxFileSize = parseFloat(inputFile.getAttribute("max")) || 20; // in MB
		const maxFileSizeInBytes = maxFileSize * 1024 * 1024;

		console.log({ maxFileSize, maxFileSizeInBytes });

		const fileInfoContainer = document.createElement("div");
		fileInfoContainer.classList.add("file-info");

		const fileNameSpan = document.createElement("span");
		fileNameSpan.classList.add("file-name");
		fileInfoContainer.appendChild(fileNameSpan);

		const removeButton = document.createElement("button");
		removeButton.type = "button";
		removeButton.classList.add("remove-file");
		removeButton.textContent = "";
		fileInfoContainer.appendChild(removeButton);

		uploadWrapper.appendChild(fileInfoContainer);

		removeButton.addEventListener("click", () => {
			inputFile.value = ""; // Clear the file input
			fileContainer.classList.remove("uploaded");
			fileNameSpan.textContent = ""; // Clear the file name
			uploadWrapper.classList.remove("has-error");
		});

		inputFile.addEventListener("change", () => {
			const { files } = inputFile;

			if (!files.length) {
				fileContainer.classList.remove("uploaded");
				return;
			}

			console.log({ files });
			// const fileSize = files[0].size / 1024;
			// const trimedFileSize = Math.round(fileSize * 100) / 100;
			console.log({ file: files[0] });
			// console.log("_CHANGE_", { files });
			fileContainer.classList.add("uploaded");
			// label.querySelector(".text").textContent = files[0].name;
			let hasError = false;

			let filesList = [];

			[...files].forEach((file) => {
				const fileSizeBytes = file.size;
				const fileSizeMB = fileSizeBytes / (1024 * 1024);
				const trimedFileSizeMB = Math.round(fileSizeMB * 100) / 100;

				console.log({ fileSizeBytes, maxFileSizeInBytes });

				filesList.push(`${file.name} (${trimedFileSizeMB}MB)`);

				if (fileSizeBytes > maxFileSizeInBytes) {
					hasError = true;
					return;
				}
			});

			if (hasError) {
				fileContainer.classList.add("has-error");
			} else {
				fileContainer.classList.remove("has-error");
			}

			fileNameSpan.textContent = filesList.join(", "); // Update the file name
		});
	});
};
