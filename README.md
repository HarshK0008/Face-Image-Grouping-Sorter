# Face Image Grouping and Sorting with Face-api.js

This project uses **face-api.js** and **Canvas** to process images, detect faces, extract face descriptors, and group images based on face similarity. The images are then organized into directories based on the grouped faces.

## Project Setup:

Before running this project, make sure you have the following installed:

- **Node.js** (v20 or later)
- **NPM** (Node Package Manager)

You will also need the following NPM packages:

- **@tensorflow/tfjs-core**: TensorFlow.js core library (required for face-api.js to work)
- **canvas**: Provides server-like environment to work with face-api.js
- **dotenv**: To manage environment variables
- **face-api.js**: Library for face detection and recognition
- **fs**: File system module to handle file operations
- **sharp**: High-performance image processing
  ### Install them one-by-one or use the other command provided below:

```
npm install @tensorflow/tfjs-core@^4.22.0
npm install canvas@^3.1.0
npm install dotenv@^16.4.7
npm install face-api.js@^0.22.2
npm install fs@^0.0.1-security
npm install sharp@^0.33.5
```

`npm install @tensorflow/tfjs-core@^4.22.0 canvas@^3.1.0 dotenv@^16.4.7 face-api.js@^0.22.2 fs@^0.0.1-security sharp@^0.33.5 `



## Directory Structure

The project is organized into the following directories:

* **`./models/`** : Contains the pre-trained models required for face-api.js. You need to download these models and place them in this folder.
* **`./dataset/`** : Directory containing the images you want to process. This is where you should store the images that will be analyzed for face grouping.
* **`./output/`** : Directory where the grouped and sorted images will be saved. After processing, images with similar faces will be organized into different directories within this folder.

### Model Files

This project uses pre-trained models from  **face-api.js** . To ensure the models are loaded properly, download the models and store them in the `./models` directory. The required models include:

* **ssdMobilenetv1** : For face detection
* **faceLandmark68Net** : For detecting facial landmarks
* **faceRecognitionNet** : For generating face descriptors

You can download the models from the official [face-api.js GitHub repository]() or use the models provided by the library.

project-folder/
│
├── dataset/              # Place your images here
├── models/               # Download the model files and place them here
├── output/               # Grouped images will be saved here
├── index.js              # Main script to run the program
├── package.json          # Project dependencies and configuration
├── .env                  # Environment variables (if needed)
└── README.md             # This file


## How to Run

Follow these steps to run the project:

1. **Prepare the images** :

* Place the images you want to process in the `./dataset/` directory. These are the images that will be analyzed for facial recognition and grouping.
* Make sure the images are in a supported format (e.g., JPG, PNG).

1. **Download the models** :

* Download the pre-trained models required for face-api.js (listed in the **Model Files** section) and place them in the `./models/` directory.

1. **Run the script** :

* Once everything is set up, you can start the image sorting process by running the following command:

 `node index.js`

   This will:

* Load the models.
* Detect faces and extract face descriptors from the images in the `./dataset/` directory.
* Group similar faces together.
* Organize the grouped images into the `./output/` directory.

1. **Check the output** :

* The images will be sorted into directories based on the groupings. Each directory in the `./output/` folder will contain images that belong to the same face group.
* For example:
  <pre class="!overflow-visible" data-start="4092" data-end="4251"><div class="contain-inline-size rounded-md border-[0.5px] border-token-border-medium relative bg-token-sidebar-surface-primary dark:bg-gray-950"><div class="flex items-center text-token-text-secondary px-4 py-2 text-xs font-sans justify-between rounded-t-[5px] h-9 bg-token-sidebar-surface-primary dark:bg-token-main-surface-secondary select-none">lua</div><div class="sticky top-9"><div class="absolute bottom-0 right-0 flex h-9 items-center pr-2"><div class="flex items-center rounded bg-token-sidebar-surface-primary px-2 font-sans text-xs text-token-text-secondary dark:bg-token-main-surface-secondary"><span class="" data-state="closed"><button class="flex gap-1 items-center select-none px-4 py-1" aria-label="Copy"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-xs"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path></svg>Copy</button></span></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="!whitespace-pre"><span><span>output</span><span>/
  ├── person_0/
  │   ├── image1.jpg
  │   ├── image2.jpg
  ├── person_1/
  │   ├── image3.jpg
  │   ├── image4.jpg</span></span></code></div></div></pre>

## Functions Overview

### `loadModels()`

* Loads the necessary models for face detection, landmarking, and face recognition.

### `extractFaceDescriptors(images)`

* Processes each image in the provided `images` array.
* Extracts and returns face descriptors for each image.

### `compareFaceDescriptors(descriptor1, descriptor2)`

* Compares two face descriptors using Euclidean distance and returns the distance.

### `groupImages(faceDescriptors)`

* Groups the images based on their face descriptors and similarity.
* Uses multiple thresholds to try for better grouping flexibility.

### `organizeImages(groups, faceDescriptors)`

* Organizes and moves images into directories based on their groupings.

### `sortImages(images)`

* The main function that coordinates the entire process from loading models to organizing images into directories.

## Troubleshooting

* **No faces detected in some images** : Ensure that the images contain visible faces. The accuracy of face detection may vary depending on the quality and clarity of the image.
* **Model loading errors** : Ensure the model files are correctly placed in the `./models/` directory.
* **Missing dependencies** : Ensure you have installed all the necessary dependencies as outlined in the **Install dependencies** section.
* Try Adjusting the thresold in range between 0-1 in float value "0.1" for more accuracy 0.9 for loose grouping of images.
* 0.3 for accurate accuracy of grouping images; 0.5 for the balanced grouping of images both works good.or use the multi-threshold by giving a range of threshold for grouping the threshold if you want to get desired results. i.e const thresholds = [0.3, 0.5]
