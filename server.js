/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Jaaved Dewan Student ID: 126045178 Date: 07/07/23
*
*  Online (Cyclic) Link: https://lazy-lime-leopard-sock.cyclic.app/about
*
********************************************************************************/ 

const express = require("express"); // Import the express module
const app = express(); // Create a new express application
const path = require("path"); // Import the path module
const storeService = require("./store-service"); // Import the store-service module
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const upload = multer(); // no { storage: storage }
const exphbs = require("express-handlebars"); 

const HTTP_PORT = process.env.PORT || 8080; // Set the port for the HTTP server

// The code above imports the required modules and sets up the HTTP port for the server.
cloudinary.config({
  cloud_name: 'dl4dntsmg',
  api_key: '444888145127496',
  api_secret: 'Mj1tl__w9pw-AhPGP8SYluV6tVU',
  secure: true
});



app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

// Define the navLink helper function
const navLink = function (url, options) {
  return (
    '<li class="nav-item"><a ' +
    (url == app.locals.activeRoute ? 'class="nav-link active"' : 'class="nav-link" ') +
    ' href="' +
    url +
    '">' +
    options.fn(this) +
    "</a></li>"
  );
};

// Define the equal helper function
const equal = function (lvalue, rvalue, options) {
  if (arguments.length < 3)
    throw new Error("Handlebars Helper equal needs 2 parameters");
  if (lvalue != rvalue) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
};


// Configure express-handlebars
app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  helpers: {
    navLink: navLink,
    equal: equal // Register the equal helper
  }
}));
app.set("view engine", "hbs"); // Set the view engine to use handlebars

app.use(express.static('public')); // Serve static files from the "public" directory

app.get('/', (req, res) => {
  res.redirect('/shop'); // Redirect the root URL to the /shop route
});


app.get('/about', (req, res) => {
  res.render('about'); // Render the "about" view
});


app.get("/shop", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let items = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      items = await storeService.getPublishedItemsByCategory(req.query.category);
    } else {
      // Obtain the published "items"
      items = await storeService.getPublishedItems();
    }

    // sort the published items by postDate
    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = items[0];

    // store the "items" and "post" data in the viewData object (to be passed to the view)
    viewData.items = items;
    viewData.item = item;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await storeService.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", { data: viewData });
});

app.get('/shop/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "item" objects
      let items = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          items = await itemData.getPublishedItemsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          items = await itemData.getPublishedItems();
      }

      // sort the published items by postDate
      items.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the item by "id"
      viewData.item = await itemData.getItemById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await itemData.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", {data: viewData})
});

app.get('/items', (req, res) => {
  const category = req.query.category;
  const minDate = req.query.minDate;

  if (category) {
    storeService.getItemsByCategory(category)
      .then((itemsByCategory) => {
        res.render("items", { items: itemsByCategory, category: category }); // Pass the category to the "items" view
      })
      .catch((error) => {
        res.render("items", { message: "No results", category: category }); // Pass the category and error message to the "items" view
      });
  } else if (minDate) {
    storeService.getItemsByMinDate(minDate)
      .then((itemsByMinDate) => {
        res.render("items", { items: itemsByMinDate, category: null }); // Pass the items filtered by minimum date to the "items" view
      })
      .catch((error) => {
        res.render("items", { message: "No results", category: null }); // Pass the error message to the "items" view
      });
  } else {
    storeService.getAllItems()
      .then((allItems) => {
        res.render("items", { items: allItems, category: null }); // Pass all items to the "items" view
      })
      .catch((error) => {
        res.render("items", { message: "No results", category: null }); // Pass the error message to the "items" view
      });
  }
});

app.get('/categories', (req, res) => {
  storeService.getCategories()
    .then((categories) => {
      res.render("categories", { categories: categories }); // Pass the categories data to the "categories" view
    })
    .catch((error) => {
      res.render("categories", { message: "No results" }); // Pass the error message to the "categories" view
    });
});



  app.get('/item/:id', (req, res) => {
    const itemId = req.params.id;
  
    storeService.getItemById(itemId)
      .then((item) => {
        if (item) {
          res.json(item); // Send JSON response containing the item
        } else {
          res.status(404).json({ error: "Item not found" }); // Send JSON response if item is not found
        }
      })
      .catch((error) => {
        res.status(500).json({ error: "Internal Server Error" }); // Send JSON response with error message
      });
  });

app.get('/items/add', (req, res) => {
  // When the '/items/add' route is accessed via GET request,
  // serve the 'additem.html' file from the 'views' directory
  res.render('additem'); // Render the "additem" view
});

app.post('/items/add', upload.single('featureImage'), (req, res) => {
  // When the '/items/add' route is accessed via POST request,
  // handle the form submission and process the uploaded file
  
  if (req.file) {
    // If a file is uploaded in the request, proceed with uploading it to Cloudinary
  
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
  
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };
  
    // Define an async function to handle the file upload
    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }
  
    // Call the upload function, which returns a promise,
    // and process the uploaded file once it is uploaded
    upload(req)
      .then((uploaded) => {
        processItem(uploaded.url);
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    // If no file is uploaded in the request, process the item without an image
    processItem('');
  }
  
    function processItem(imageUrl) {
      req.body.featureImage = imageUrl;
  
      // Process the req.body and add it as a new item in your database
      const newItem = req.body;
      // Add the new item to your database or perform other operations
      storeService.addItem(newItem)
        .then(() => {
          res.redirect('/items'); // Redirect to /items after adding the item
        })
        .catch((error) => {
          console.error(error);
          res.status(500).json({ error: "Internal Server Error" }); // Send JSON response with error message
        });
    }
  });

app.use((req, res) => {
  res.status(404).send("Page Not Found"); // Send a 404 response for unknown routes
});


storeService.initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("Express http server listening on port " + HTTP_PORT);// Log console if it succeeds
    });
  })
  .catch((error) => {
    console.error("Error initializing store service:", error); // Log an error if initialization fails
  });