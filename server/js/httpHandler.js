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
  console.log('Serving request type ' + req.method + ' for url ' + req.url);

  // conditional to check req type
  switch(req.method) {
    case 'GET':
      if (req.url === '/background.jpg') {
        res.writeHead(200, {"content-type": "image/jpeg", ...headers});
        fs.readFile(exports.backgroundImageFile, (err, data) => {
          res.write(data);
          res.end();
        })
      } else {
        res.writeHead(200, {"content-type": "text/html", ...headers});
        var queuedMessageFromServer = messages.dequeue()
        if (queuedMessageFromServer !== undefined) {
          res.write(queuedMessageFromServer);
          res.end();
        }
      }
      break;
    case 'POST':
      req.on('data', directionKey => {
        messages.enqueue(directionKey)
      })
      res.writeHead(200, headers);
      res.end();
      // filter between the file upload and the command keys being 'pressed'
      break;
    case 'OPTIONS': res.writeHead(200, headers);
      res.end()
      break;
      // delete
      // put
    default: res.writeHead(404, headers);
  }


  // // signifying that the response object is finished being created
  // res.end();
  next(); // invoke next() at the end of a request to help with testing!
};

