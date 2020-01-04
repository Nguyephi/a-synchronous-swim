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
      res.writeHead(200, {"content-type": "text/html", ...headers});
      // var outputKeyDirections = ['left', 'right', 'up', 'down'];
      // var randomArr = Math.floor(Math.random() * outputKeyDirections.length);
      // var randomOutputKeyDirection = outputKeyDirections[randomArr];
      var queuedMessageFromServer = messages.dequeue()
      if (queuedMessageFromServer !== undefined) {
        res.write(queuedMessageFromServer);
      }
      break;
    case 'POST':
      req.on('data', directionKey => {
        console.log(typeof directionKey);
        messages.enqueue(directionKey)
      })
      res.writeHead(200, headers);
      // filter between the file upload and the command keys being 'pressed'
      break;
    case 'OPTIONS': res.writeHead(200, headers);
      break;
      // delete
      // put
    default: res.writeHead(404, headers);
  }

  // console.log(req.postData)
  // 200 status code
  // sets everything for the header. status code and headers
  // res.writeHead(200, headers);
  // res.writeHead(setResponceData());
  // adding data to the 'body' or whatever is posting the request?

  // signifying that the response object is finished being created
  res.end();
  next(); // invoke next() at the end of a request to help with testing!
};

