const fs = require('fs');
const path = require('path');
const headers = require('./cors');
const multipart = require('./multipartUtils');
const messages = require('./messageQueue')

// Path for the background image ///////////////////////
module.exports.backgroundImageFile = path.join('.', 'background.jpg');
////////////////////////////////////////////////////////

let messageQueue = null;
module.exports.initialize = (queue) => {
  messageQueue = queue;
};

// handles the GET request
module.exports.router = (req, res, next = ()=>{}) => {
  // console.log('Serving request type ' + req.method + ' for url ' + req.url);

  // conditional to check req type
  switch(req.method) {
    case 'GET':
      if (req.url === '/background.jpg') {
        fs.readFile(module.exports.backgroundImageFile, (err, data) => {
          if (err) {
            res.writeHead(404);
          } else {
            res.writeHead(200, {"content-type": "image/jpeg"});
            res.write(data, 'binary');
          }
          res.end();
          next();
        })
      } else {
        res.writeHead(200, {"content-type": "text/html", headers});
        var queuedMessageFromServer = messages.dequeue()
        if (queuedMessageFromServer !== undefined) {
          res.write(queuedMessageFromServer);
          res.end();
          next();
        }
      }
      break;
    case 'POST':
      if (req.url === '/background.jpg') {
        var imageData = Buffer.alloc(0);

        req.on('data', (chunk) => {
          imageData = Buffer.concat([imageData, chunk]);
        });

        req.on('end', () => {

          var file = multipart.getFile(imageData);

          fs.writeFile(module.exports.backgroundImageFile, file.data, (err) => {
            res.writeHead(err ? 400 : 201);
            res.end();
            next();
          })

        })



      } else {
        req.on('data', directionKey => {
          messages.enqueue(directionKey)
        })
        res.writeHead(201, headers);
        res.end();
        next()
      }
      // filter between the file upload and the command keys being 'pressed'
      break;
    case 'OPTIONS': res.writeHead(200, headers);
      res.end()
      next()
      break;
      // delete
      // put
    default:
      res.writeHead(404, headers);
      res.end()
      next();
  }


  // // signifying that the response object is finished being created
  // res.end();
  // next(); // invoke next() at the end of a request to help with testing!
};

