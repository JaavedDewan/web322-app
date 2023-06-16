/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Jaaved Dewan Student ID: 126045178 Date: 06/16/23
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

const HTTP_PORT = process.env.PORT || 8080; // Set the port for the HTTP server

// The code above imports the required modules and sets up the HTTP port for the server.
cloudinary.config({
  cloud_name: 'dl4dntsmg',
  api_key: '444888145127496',
  api_secret: 'Mj1tl__w9pw-AhPGP8SYluV6tVU',
  secure: true
});


app.use(express.static('public')); // Serve static files from the "public" directory

app.get('/', (req, res) => {
  res.redirect('/about'); // Redirect the root URL to the /about route
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html')); // Send the about.html file as the response
});



app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
      .then((publishedItems) => {
        res.json(publishedItems); // Send JSON response containing published items
      })
      .catch((error) => {
        res.status(500).json({ error: "Internal Server Error" }); // Send JSON response with error message
      });
  });
  
  app.get('/items', (req, res) => {
    const category = req.query.category;
    const minDate = req.query.minDate;
  
    if (category) {
      storeService.getItemsByCategory(category)
        .then((itemsByCategory) => {
          res.json(itemsByCategory); // Send JSON response containing items filtered by category
        })
        .catch((error) => {
          res.status(500).json({ error: "Internal Server Error" }); // Send JSON response with error message
        });
    } else if (minDate) {
      storeService.getItemsByMinDate(minDate)
        .then((itemsByMinDate) => {
          res.json(itemsByMinDate); // Send JSON response containing items filtered by minimum date
        })
        .catch((error) => {
          res.status(500).json({ error: "Internal Server Error" }); // Send JSON response with error message
        });
    } else {
      storeService.getAllItems()
        .then((allItems) => {
          res.json(allItems); // Send JSON response containing all items
        })
        .catch((error) => {
          res.status(500).json({ error: "Internal Server Error" }); // Send JSON response with error message
        });
    }
  });
  
  
  app.get('/categories', (req, res) => {
    storeService.getCategories()
      .then((allCategories) => {
        res.json(allCategories); // Send JSON response containing all categories
      })
      .catch((error) => {
        res.status(500).json({ error: "Internal Server Error" }); // Send JSON response with error message
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
  res.sendFile(path.join(__dirname, 'views', 'additem.html'));
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