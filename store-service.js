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

// Returns published items filtered by category
function getPublishedItemsByCategory(category) {
  return new Promise((resolve, reject) => {
    const publishedItemsByCategory = items.filter((item) => item.published === true && item.category === category); // Filter items based on published flag and category
    if (publishedItemsByCategory.length === 0) {
      reject("No published items found for the given category"); // Reject the promise if no published items are found for the given category
      return;
    }
    resolve(publishedItemsByCategory); // Resolve the promise with the published items array filtered by category
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

function getItemsByCategory(category) {
  return new Promise((resolve, reject) => {
    // Filter the items based on the specified category
    const filteredItems = items.filter((item) => item.category === category);
    
    // If no items match the category, reject the promise with an error message
    if (filteredItems.length === 0) {
      reject("No results returned");
      return;
    }
    
    // Resolve the promise with the filtered items
    resolve(filteredItems);
  });
}

function getItemsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    // Parse the minimum date string into a Date object
    const minDate = new Date(minDateStr);

    // Filter the items based on the minimum date
    const filteredItems = items.filter((item) => new Date(item.postDate) >= minDate);

    // If no items match the minimum date, reject the promise with an error message
    if (filteredItems.length === 0) {
      reject("No results returned");
      return;
    }

    // Resolve the promise with the filtered items
    resolve(filteredItems);
  });
}

function getItemById(id) {
  return new Promise((resolve, reject) => {
    // Find the item with the specified ID
    const item = items.find((item) => item.id === id);

    // If no item matches the ID, reject the promise with an error message
    if (!item) {
      reject("No result returned");
      return;
    }

    // Resolve the promise with the found item
    resolve(item);
  });
}

function addItem(itemData) {
  return new Promise((resolve, reject) => {
    // Set the 'published' property based on the provided data
    itemData.published = itemData.published === undefined ? false : true;

    // Assign a unique ID to the item
    itemData.id = items.length + 1;

    // Add the current date as the 'postDate' property
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    itemData.postDate = formattedDate;

    // Add the item to the 'items' array
    items.push(itemData);

    // Resolve the promise with the added item
    resolve(itemData);
  });
}



module.exports = {
  addItem,
  initialize,
  getAllItems,
  getItemsByCategory,
  getItemById,
  getItemsByMinDate,
  getPublishedItems,
  getPublishedItemsByCategory,
  getCategories,
};
