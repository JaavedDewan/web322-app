/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Jaaved Dewan Student ID: 126045178 Date: 05/31/23
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
    storeService.getAllItems()
      .then((allItems) => {
        res.json(allItems); // Send JSON response containing all items
      })
      .catch((error) => {
        res.status(500).json({ error: "Internal Server Error" }); // Send JSON response with error message
      });
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

  app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addItem.html'));
  });
  

app.use((req, res) => {
  res.status(404).send("Page Not Found"); // Send a 404 response for unknown routes
});

app.post('/items/add', upload.single('featureImage'), (req, res) => {
  if (req.file) {
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

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req)
      .then((uploaded) => {
        processItem(uploaded.url);
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    processItem('');
  }

  // function processItem(imageUrl) {
  //   req.body.featureImage = imageUrl;

  //   // TODO: Process the req.body and add it as a new Item before redirecting to /items

  //   // Example: 
  //   // const newItem = req.body;
  //   // // Add the new item to your database or perform other operations
  //   // // ...
  //   // // Redirect to /items
  //   // res.redirect('/items');
  // }
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
