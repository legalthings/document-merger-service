'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const DocumentMerger = require('document-merger');
const info = require('./package');
const winston = require('winston');
const expressWinston = require('express-winston');

app.use(bodyParser.json({ limit: '50mb'}));
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  )
}));

app.post('/merge', (req, res) => {
  if (!req.body) {
    return res.status(400).send('no or invalid body given');
  }

  if (!req.body instanceof Object && !req.body instanceof Array) {
    return res.status(400).send('payload must be either an object or array of documents');
  }

  if (!Array.isArray(req.body) && !req.body.documents) {
    return res.status(400).send('documents property must be given if payload is an object');
  }

  if (req.body.documents && !Array.isArray(req.body.documents)) {
    return res.status(400).send('documents must be an array');
  }

  const html = req.body.documents || req.body;
  const documents = html
    .filter((doc) => typeof doc === 'string')
    .map((doc) => ({ content: doc, type: 'html' }));

  const options = { documents };
  if (!Array.isArray(req.body)) {
    delete req.body.documents;
    Object.assign(options, req.body);
  }

  const merger = new DocumentMerger();
  res.status(200).send(merger.merge(options));
});

app.get('/', (req, res) => {
  res.json({
    name: info.name,
    description: info.description,
    version: info.version
  });
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
