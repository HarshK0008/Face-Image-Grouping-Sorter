const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Path to the images folder
const datasetPath = path.join(__dirname, "dataset");

// Resize all images to 200x300 pixels
async function resizeImages() {
	const files = fs.readdirSync(datasetPath);

	for (let file of files) {
		const filePath = path.join(datasetPath, file);
		const outputFilePath = path.join(datasetPath, `resized_${file}`);

		// Only process image files (JPG, JPEG, PNG)
		if (
			path.extname(file).toLowerCase() === ".jpg" ||
			path.extname(file).toLowerCase() === ".jpeg" ||
			path.extname(file).toLowerCase() === ".png"
		) {
			try {
				await sharp(filePath)
					.resize(200, 300) // Resize to 200x300 pixels
					.toFile(outputFilePath);
				console.log(`Resized image saved to: ${outputFilePath}`);
			} catch (err) {
				console.error(`Error resizing image ${file}: ${err}`);
			}
		}
	}
}

// Run the resize operation
resizeImages().catch(console.error);
