const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
const AWS = require('aws-sdk');
const fs = require('fs');

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json({ limit: '50mb' }) );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({                     // to support URL-encoded bodies
  extended: true,
  limit: '50mb'
})); 


AWS.config.update({ region: 'eu-west-1', accessKeyId: process.env.ACCESSKEYID, secretAccessKey: process.env.SECRETACCESSKEY });
const rekognition = new AWS.Rekognition({ apiVersion: '2016-06-27' });

const decodeBase64Image = (dataString) => {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  const response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = Buffer.from(matches[2], 'base64');

  return response;
}

app.post('/api/image', function (req, res) {
  rekognition.detectFaces({
    Image: {
      Bytes: decodeBase64Image(req.body.image).data
    },
    Attributes: ["ALL"]
  }).promise().then(data => {
    // Send the first face it finds
    res.json(data.FaceDetails[0]);
  }).catch(console.log);
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT || 8080);
