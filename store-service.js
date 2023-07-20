const Sequelize = require('sequelize');
var sequelize = new Sequelize('usqrfokn', 'usqrfokn', 'UHRz9dM5emO2PfpubJXTsMthhE2cTVlI', {
    host: 'stampy.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
    
});

function formatDate(dateObj) {
  let year = dateObj.getFullYear();
  let month = (dateObj.getMonth() + 1).toString();
  let day = dateObj.getDate().toString();
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Define the "Item" model
const Item = sequelize.define('Item', {
  body: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  postDate: {
    type: Sequelize.DATE,
    allowNull: false
  },
  featureImage: {
    type: Sequelize.STRING,
    allowNull: true
  },
  published: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  price: {
    type: Sequelize.DOUBLE,
    allowNull: true
  }
});

// Define the "Category" model
const Category = sequelize.define('Category', {
  category: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

// Define the relationship between Item and Category (assuming a many-to-many relationship)
Item.belongsToMany(Category, { through: 'ItemCategory' });
Category.belongsToMany(Item, { through: 'ItemCategory' });

// Synchronize the models with the database (create the tables if they don't exist)
sequelize.sync();


// Reads the items.json and categories.json files and initializes the items and categories arrays
function initialize() {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        console.log('Database synced successfully.');
        resolve(); // Indicate success to the calling function
      })
      .catch((error) => {
        console.error('Error syncing the database:', error);
        reject('Unable to sync the database'); // Indicate failure to the calling function
      });
  });
}

// Returns all items
function getAllItems() {
  return new Promise((resolve, reject) => {
    Item.findAll()
      .then((items) => {
        if (items.length === 0) {
          reject('No items found');
        } else {
          resolve(items);
        }
      })
      .catch((error) => {
        console.error('Error fetching items:', error);
        reject('Unable to fetch items');
      });
  });
}

// Returns published items
function getPublishedItems() {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        published: true
      }
    })
      .then((items) => {
        if (items.length === 0) {
          reject('No results returned'); // Indicate no results returned
        } else {
          resolve(items); // Indicate success and provide the data
        }
      })
      .catch((error) => {
        console.error('Error fetching published items:', error);
        reject('Unable to fetch published items'); // Indicate failure to fetch published items
      });
  });
}


// Returns published items filtered by category
function getPublishedItemsByCategory(category) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        published: true,
        category: category
      }
    })
      .then((items) => {
        if (items.length === 0) {
          reject('No results returned'); // Indicate no results returned
        } else {
          resolve(items); // Indicate success and provide the data
        }
      })
      .catch((error) => {
        console.error('Error fetching published items by category:', error);
        reject('Unable to fetch published items by category'); // Indicate failure to fetch published items by category
      });
  });
}


// Returns all categories
function getCategories() {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then((categories) => {
        if (categories.length === 0) {
          reject('No results returned'); // Indicate no results returned
        } else {
          resolve(categories); // Indicate success and provide the data
        }
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
        reject('Unable to fetch categories'); // Indicate failure to fetch categories
      });
  });
}


function getItemsByCategory(category) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        category: category
      }
    })
      .then((items) => {
        if (items.length === 0) {
          reject('No results returned'); // Indicate no results returned
        } else {
          resolve(items); // Indicate success and provide the data
        }
      })
      .catch((error) => {
        console.error('Error fetching items by category:', error);
        reject('Unable to fetch items by category'); // Indicate failure to fetch items by category
      });
  });
}


const { Op } = require('sequelize');

function getItemsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        postDate: {
          [Op.gte]: new Date(minDateStr)
        }
      }
    })
      .then((items) => {
        if (items.length === 0) {
          reject('No results returned'); // Indicate no results returned
        } else {
          resolve(items); // Indicate success and provide the data
        }
      })
      .catch((error) => {
        console.error('Error fetching items by min date:', error);
        reject('Unable to fetch items by min date'); // Indicate failure to fetch items by min date
      });
  });
}


function getItemById(id) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        id: id
      }
    })
      .then((items) => {
        if (items.length === 0) {
          reject('No results returned'); // Indicate no results returned
        } else {
          resolve(items[0]); // Indicate success and provide the first item data
        }
      })
      .catch((error) => {
        console.error('Error fetching item by ID:', error);
        reject('Unable to fetch item by ID'); // Indicate failure to fetch item by ID
      });
  });
}


function addItem(itemData) {
  // Ensure the "published" property is set correctly
  itemData.published = itemData.published ? true : false;

  // Iterate over every property in the object to check for empty values and replace them with null
  for (const key in itemData) {
    if (itemData.hasOwnProperty(key) && itemData[key] === "") {
      itemData[key] = null;
    }
  }

  // Assign a value for postDate (the current date)
  itemData.postDate = new Date();

  return new Promise((resolve, reject) => {
    Item.create(itemData)
      .then((createdItem) => {
        resolve(createdItem); // Indicate success and provide the created item data
      })
      .catch((error) => {
        console.error('Error creating item:', error);
        reject('Unable to create item'); // Indicate failure to create the item
      });
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
