require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const isUrl = require('is-url');
let mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const Schema = mongoose.Schema;

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
  name: { _id: Number, name: String }
});

const Url = mongoose.model("Url", urlSchema);

const saveUrl = async function (url) {
  try {
    let data = new Url({ name: url }).save()
    return data
  } catch (error) {
    console.log(error);
  }
}
const findUrlByName = async (name) => {
  Url.find({ name: name }).then((res) => {
    return res
  }).catch((err) => {
    return err
  })
};
const findUrlById = async (id) => {
  try {
    let url = Url.findById(id)
    return url
  } catch (error) {
    console.log(error);
  }
};

// Start of the proyect
app.post('/api/shorturl', function (req, res, next) {
  originalURL = req.body.url
  if (isUrl(originalURL)) {
    let { exists } = findUrlByName(originalURL)
    if (exists == true) {
      res.json({ original_url: exists.name, short_url: exists._id })
    } else if (exists == undefined) {
      let newUrl = saveUrl(originalURL)
      console.log(`Name: ${newUrl.name} and id: ${newUrl._id}`);
      res.json({ original_url: newUrl.name, short_url: newUrl._id })
    }
  } else {
    res.json({ error: 'invalid url' })
  }
})

app.get('/api/shorturl/:id', function (req, res, next) {
  id = req.params.id
  let url = findUrlById(id)
  res.json({ original_url: url.name, short_url: url._id })
})