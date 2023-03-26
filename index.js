require('dotenv').config();
const express = require('express');
const mongo = require('mongodb');
const cors = require('cors');
const app = express();
const validUrl = require('valid-url');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(typeof (process.env.MONGO_URI));
const Schema = mongoose.Schema;
const shortid = (() => (id = 0, () => id++))();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

// Database configuration

const urlSchema = new Schema({
  original_url: {
    type: String
  },
  short_url: {
    type: Number
  }
});


const URL = mongoose.model("URL", urlSchema);

// Start of the proyect
app.post('/api/shorturl', async function (req, res, next) {
  const url = req.body.url
  const urlCode = shortid()
  if (!validUrl.isWebUri(url)) {
    res.json({ error: 'invalid url' })
  } else {
    try {
      let exists = await URL.findOne({
        original_url: url
      })
      if (exists) {
        res.json({
          original_url: exists.original_url,
          short_url: exists.short_url
        });
      } else {
        let newUrl = new URL({
          original_url: url,
          short_url: urlCode
        })
        await newUrl.save()
        res.json({
          original_url: newUrl.original_url,
          short_url: newUrl.short_url
        })
      }
    } catch (error) {
      console.log(error);
      res.json('Server error...')
    }
  }
})

app.get('/api/shorturl/:short_url?', async function (req, res) {
  try {
    id = req.params.id
    let url = await URL.findOne({
      short_url: req.params.short_url
    })
    if (url) {
      return res.redirect(url.original_url)
    } else {
      return res.json('No URL found')
    }
  } catch (error) {
    console.log(error);
    res.json('Server error...')
  }
})