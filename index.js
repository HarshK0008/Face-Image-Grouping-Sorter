const fs = require("fs");
const path = require("path");
const faceapi = require("face-api.js");
const canvas = require("canvas");

// Canvas provides server like enviornment to the face-api.js to work
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Load the models from models folder for the face-api.js to use to read the images.
async function loadModels() {
	console.log("Loading models...");
	await faceapi.nets.ssdMobilenetv1.loadFromDisk("./models");
	await faceapi.nets.faceLandmark68Net.loadFromDisk("./models");
	await faceapi.nets.faceRecognitionNet.loadFromDisk("./models");
	console.log("Models loaded.");
}

// Function to extract face descriptors from images (Image data in high-dimensional vector)
async function extractFaceDescriptors(images) {
	const faceDescriptors = [];

	for (const imagePath of images) {
		const image = await canvas.loadImage(imagePath); // Using canvas.loadImage from 'canvas' library
		const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();

		if (detections.length > 0) {
			faceDescriptors.push({
				image: imagePath,
				descriptor: detections[0].descriptor, // Take the first face's descriptor
			});
			console.log(`Face descriptors for ${path.basename(imagePath)} added.`);
		} else {
			console.log(`No faces detected in ${path.basename(imagePath)}.`);
		}
	}

	console.log(`Extracted descriptors for ${faceDescriptors.length} images.`);
	return faceDescriptors;
}

// Function to compare face descriptors
function compareFaceDescriptors(descriptor1, descriptor2) {
	const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
	console.log(`Comparing descriptors: distance = ${distance}`);
	return distance;
}

//! Single threshold for comparison "WORKING" efficiently.
// Function to group images based on face similarity
// async function groupImages(faceDescriptors) {
// 	const groups = []; // This will hold our image groups
// 	const threshold = 0.2;
// 	console.log("Grouping images...");

// 	// Loop through each face descriptor and compare it with all others
// 	for (let i = 0; i < faceDescriptors.length; i++) {
// 		const currentFace = faceDescriptors[i];
// 		let groupFound = false;
// 		console.log(`Checking face ${i + 1} (${path.basename(currentFace.image)})...`);

// 		// Check the current face descriptor against all previously checked groups
// 		for (let j = 0; j < groups.length; j++) {
// 			const group = groups[j];
// 			const firstFaceDescriptor = faceDescriptors[group[0]].descriptor;
// 			const distance = compareFaceDescriptors(currentFace.descriptor, firstFaceDescriptor);

// 			// Log the distance for better visibility
// 			console.log(
// 				`Distance between ${path.basename(currentFace.image)} and ${path.basename(
// 					faceDescriptors[group[0]].image
// 				)}: ${distance}`
// 			);

// 			if (distance < threshold) {
// 				console.log(`Adding ${path.basename(currentFace.image)} to group ${j} (distance = ${distance})`);
// 				group.push(i); // If the current face is similar to the group, add to that group
// 				groupFound = true;
// 				break;
// 			}
// 		}

// 		// If no group was found, create a new group for this image
// 		if (!groupFound) {
// 			console.log(`Creating a new group for ${path.basename(currentFace.image)}`);
// 			groups.push([i]); // Start a new group with the current face
// 		}
// 	}

// 	console.log(`Grouping completed. Total groups: ${groups.length}`);
// 	return groups;
// }

// Function to group images based on multiple face similarity thresholds
async function groupImages(faceDescriptors) {
	const groups = []; // This will hold our image groups
	const thresholds = [0.3, 0.4, 0.6]; // List of thresholds to try for more flexibility, adjust between 0-1, 0 for perfect 1 for loose check
	console.log("Grouping images...");

	// Loop through each face descriptor and compare it with all others
	for (let i = 0; i < faceDescriptors.length; i++) {
		const currentFace = faceDescriptors[i];
		let groupFound = false;
		console.log(`Checking face ${i + 1} (${path.basename(currentFace.image)})...`);

		// Check the current face descriptor against all previously checked groups
		for (let j = 0; j < groups.length; j++) {
			const group = groups[j];
			const firstFaceDescriptor = faceDescriptors[group[0]].descriptor;

			// Try comparing using multiple thresholds
			for (const threshold of thresholds) {
				const distance = compareFaceDescriptors(currentFace.descriptor, firstFaceDescriptor);
				console.log(
					`Distance between ${path.basename(currentFace.image)} and ${path.basename(
						faceDescriptors[group[0]].image
					)} at threshold ${threshold}: ${distance}`
				);

				// If distance is below the threshold, add to the group
				if (distance < threshold) {
					console.log(`Adding ${path.basename(currentFace.image)} to group ${j} (distance = ${distance})`);
					group.push(i); // If the current face is similar to the group, add it to the group
					groupFound = true;
					break; // Break after the first threshold match
				}
			}

			// If a group was found, stop checking further thresholds for this group
			if (groupFound) break;
		}

		// If no group was found, create a new group for this image
		if (!groupFound) {
			console.log(`Creating a new group for ${path.basename(currentFace.image)}`);
			groups.push([i]); // Start a new group with the current face
		}
	}

	console.log(`Grouping completed. Total groups: ${groups.length}`);
	return groups;
}

// Function to organize images into directories
async function organizeImages(groups, faceDescriptors) {
	const outputDir = "./output";

	// Create the output directory if it doesn't exist
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir);
	}

	console.log("Organizing images into directories...");

	// Iterate over the grouped images and move them into person-specific directories
	for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
		const group = groups[groupIndex];

		// Skip groups with less than 2 images
		if (group.length < 2) {
			console.log(`Skipping group ${groupIndex} - less than 2 images found.`);
			continue;
		}

		// Create a directory for this group/person
		const personDir = path.join(outputDir, `person_${groupIndex}`);
		if (!fs.existsSync(personDir)) {
			fs.mkdirSync(personDir);
		}

		// Copy images to the new directory
		for (const index of group) {
			const imagePath = faceDescriptors[index].image;
			const destPath = path.join(personDir, path.basename(imagePath));
			fs.copyFileSync(imagePath, destPath);
			console.log(`Image ${path.basename(imagePath)} copied to ${personDir}`);
		}

		console.log(`Images for group ${groupIndex} sorted into folder.`);
	}
}

// Main function to handle image sorting
async function sortImages(images) {
	console.log("Starting image sorting...");

	// Load models and process face descriptors
	await loadModels();
	const faceDescriptors = await extractFaceDescriptors(images);

	// Group images based on face descriptors
	const groups = await groupImages(faceDescriptors);

	// Organize images into directories
	await organizeImages(groups, faceDescriptors);

	console.log("Image sorting completed.");
}

// Example usage:
const imagesDir = "./dataset"; // Directory containing your images
const images = fs.readdirSync(imagesDir).map((file) => path.join(imagesDir, file));

sortImages(images).catch((err) => console.error(err));
