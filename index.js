require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();
const url = require('url')
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
const { hostname } = require('os');

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let urls = [];

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(`${process.cwd()}/public`));

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

let Url = mongoose.model('Url', urlSchema);

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

app.post('/api/shorturl', function(req, res){
  var urlLink = url.parse(req.body.url)
  dns.lookup(urlLink.hostname, function(err, address, family) {
    if(err || urlLink.hostname === null){
      res.json({
        error: "invalid url"
      });
      return console.log(err);
    }
    var s = Math.floor(Math.random() * 1000);
    var urlObj = new Url({original_url: urlLink.href, short_url: s});
    urlObj.save(function(err, data){
      if(err) return console.log(err);
      res.json({
        original: urlLink.href,
        short: s
      });
    });
  });
});

app.get('/api/shorturl/:short', function(req, res){
  var sht = req.params.short;
  Url.findOne({short_url: sht}, function(err, data){
    if(err) return console.log(err);
    res.redirect(data.original_url);
  });
});
