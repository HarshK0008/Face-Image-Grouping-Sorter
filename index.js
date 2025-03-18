const fs = require("fs");
const path = require("path");
const faceapi = require("face-api.js");
const canvas = require("canvas");

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

async function loadModels() {
	console.log("Loading models...");
	await faceapi.nets.ssdMobilenetv1.loadFromDisk("./models");
	await faceapi.nets.faceLandmark68Net.loadFromDisk("./models");
	await faceapi.nets.faceRecognitionNet.loadFromDisk("./models");
	console.log("Models loaded.");
}

async function extractFaceDescriptors(images) {
	const faceDescriptors = [];

	for (const imagePath of images) {
		try {
			const image = await canvas.loadImage(imagePath);
			const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();

			if (detections.length > 0) {
				detections.forEach((detection) => {
					faceDescriptors.push({
						image: imagePath,
						descriptor: detection.descriptor,
					});
				});
				console.log(`Face descriptors for ${path.basename(imagePath)} added.`);
			} else {
				console.log(`No faces detected in ${path.basename(imagePath)}.`);
			}
		} catch (error) {
			console.error(`Error processing image ${imagePath}:`, error);
		}
	}

	console.log(`Extracted descriptors for ${faceDescriptors.length} faces.`);
	return faceDescriptors;
}

function compareFaceDescriptors(descriptor1, descriptor2) {
	const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
	console.log(`Comparing descriptors: distance = ${distance}`);
	return distance;
}

async function countSoloImages(faceDescriptors) {
	const personImageCount = {};

	// Count how many images (solo or group) each person has
	faceDescriptors.forEach((descriptor, index) => {
		const personID = path.basename(descriptor.image).split("_")[0]; // Assuming person is identified by part of filename
		if (!personImageCount[personID]) {
			personImageCount[personID] = [];
		}
		personImageCount[personID].push(index);
	});

	// Filter people with more than 2 images
	const validPeople = Object.entries(personImageCount).filter(([personID, indices]) => indices.length > 2);

	return validPeople;
}

async function groupFaces(faceDescriptors) {
	const groups = [];
	const looseThreshold = 0.4; //keep it max 0.5 for right grouping of person's images
	const tightThreshold = 0.3;
	const validPeople = await countSoloImages(faceDescriptors);

	// Start by trying to group faces based on descriptors
	for (let i = 0; i < faceDescriptors.length; i++) {
		const currentFace = faceDescriptors[i];
		let groupFound = false;

		// First, check if this person is in a valid group (someone with more than 5 images)
		for (let j = 0; j < groups.length; j++) {
			const group = groups[j];
			const firstFaceDescriptor = faceDescriptors[group[0]].descriptor;

			// Try matching using loose threshold first
			const looseDistance = compareFaceDescriptors(currentFace.descriptor, firstFaceDescriptor);

			if (looseDistance < looseThreshold) {
				console.log(`Adding ${path.basename(currentFace.image)} to group ${j} (loose threshold match)`);
				group.push(i);
				groupFound = true;
				break;
			}
		}

		// Check for tight threshold if no match was found
		if (!groupFound) {
			for (let j = 0; j < groups.length; j++) {
				const group = groups[j];
				const firstFaceDescriptor = faceDescriptors[group[0]].descriptor;

				const tightDistance = compareFaceDescriptors(currentFace.descriptor, firstFaceDescriptor);

				if (tightDistance < tightThreshold) {
					console.log(`Adding ${path.basename(currentFace.image)} to group ${j} (tight threshold match)`);
					group.push(i);
					groupFound = true;
					break;
				}
			}
		}

		// If no group found, create a new group
		if (!groupFound) {
			console.log(`Creating a new group for ${path.basename(currentFace.image)} (no match)`);
			groups.push([i]);
		}
	}

	console.log(`Grouping completed. Total groups: ${groups.length}`);
	return groups;
}

async function organizeImages(groups, faceDescriptors) {
	const outputDir = "./output";

	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir);
	}

	console.log("Organizing images into directories...");

	for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
		const group = groups[groupIndex];

		// Skip groups with less than 5 images (they can't form a valid group) lower the grouping number lesser the accuracy.
		if (group.length < 5) {
			console.log(`Skipping group ${groupIndex} - less than 5 images found.`);
			continue;
		}

		const personDir = path.join(outputDir, `person_${groupIndex}`);
		if (!fs.existsSync(personDir)) {
			fs.mkdirSync(personDir);
		}

		for (const index of group) {
			const imagePath = faceDescriptors[index].image;
			const destPath = path.join(personDir, path.basename(imagePath));
			fs.copyFileSync(imagePath, destPath);
			console.log(`Image ${path.basename(imagePath)} copied to ${personDir}`);
		}

		console.log(`Images for group ${groupIndex} sorted into folder.`);
	}
}

async function sortImages(images) {
	console.log("Starting image sorting...");

	// Load models and process face descriptors
	await loadModels();
	const faceDescriptors = await extractFaceDescriptors(images);

	// Group faces based on the face descriptors using thresholds
	const groups = await groupFaces(faceDescriptors);

	// Organize images into directories after grouping
	await organizeImages(groups, faceDescriptors);

	console.log("Image sorting completed.");
}

const imagesDir = "./dataset"; // Directory containing your images
const images = fs.readdirSync(imagesDir).map((file) => path.join(imagesDir, file));

sortImages(images).catch((err) => console.error(err));
