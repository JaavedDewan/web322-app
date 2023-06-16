const fs = require("fs"); // Import the built-in file system module to read files
const path = require("path"); // Import the built-in path module to handle file paths


// Define the file paths for items.json and categories.json
const dataPath = path.join(__dirname, "data");
const itemsFile = path.join(dataPath, "items.json");
const categoriesFile = path.join(dataPath, "categories.json");

let items = []; // Array to store items data
let categories = []; // Array to store categories data

// Reads the items.json and categories.json files and initializes the items and categories arrays
function initialize() {
  return new Promise((resolve, reject) => {
    // Read items.json file
    fs.readFile(itemsFile, "utf8", (err, data) => {
      if (err) {
        reject("Unable to read items.json");
        return;
      }
      items = JSON.parse(data); // Parse the JSON data and assign it to the items array

      // Read categories.json file
      fs.readFile(categoriesFile, "utf8", (err, data) => {
        if (err) {
          reject("Unable to read categories.json");
          return;
        }
        categories = JSON.parse(data); // Parse the JSON data and assign it to the categories array
        resolve(); // Resolve the promise once both files are read and arrays are initialized
      });
    });
  });
}

// Returns all items
function getAllItems() {
  return new Promise((resolve, reject) => {
    if (items.length === 0) {
      reject("No items found"); // Reject the promise if the items array is empty
      return;
    }
    resolve(items); // Resolve the promise with the items array
  });
}

// Returns published items
function getPublishedItems() {
  return new Promise((resolve, reject) => {
    const publishedItems = items.filter((item) => item.published === true); // Filter items based on published flag
    if (publishedItems.length === 0) {
      reject("No published items found"); // Reject the promise if no published items are found
      return;
    }
    resolve(publishedItems); // Resolve the promise with the published items array
  });
}

// Returns all categories
function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length === 0) {
      reject("No categories found"); // Reject the promise if the categories array is empty
      return;
    }
    resolve(categories); // Resolve the promise with the categories array
  });
}

function addItem(itemData) {
  return new Promise((resolve, reject) => {
    if (itemData.published === undefined) {
      itemData.published = false;
    } else {
      itemData.published = true;
    }

    itemData.id = items.length + 1;
    items.push(itemData);

    resolve(itemData);
  });
}


module.exports = {
  addItem,
  initialize,
  getAllItems,
  getPublishedItems,
  getCategories,
};
