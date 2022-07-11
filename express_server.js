const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs") // set template enmjine as ejs

function generateRandomString() {
  let randomString = '';
  let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'

  for(let i=0; i < 6; i++){
    let randomIndex = Math.floor(Math.random()*36)
    randomString += possibleCharacters.charAt(randomIndex);
  }
  return randomString;
};


const urlDatabase = {
  //id: longURL
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Getting ready for POST requests
app.use(express.urlencoded({ extended: true }));

/////////////////
//POST
/////////////////

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let id = generateRandomString()
  urlDatabase[id] = req.body;
  res.send(id); // Respond with 'Ok' (we will replace this)
});

/////////////////
//Routes
/////////////////
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase  };
  res.render("urls_show", templateVars);
});


