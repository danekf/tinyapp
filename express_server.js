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

//Getting ready for POST requests, allows for use of objects in req.body as an example. Without these magic words it just wont work.
app.use(express.urlencoded({ extended: true }));

/////////////////
//POST
/////////////////

//short URL page with link to redirect
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let id = generateRandomString()
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`); 
});

//detele button on urls_index
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id]
  res.redirect(`/urls`); //send us to the URL index page again

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

app.get("/u/:id", (req, res) => {
  res.redirect(urlDatabase[req.params.id]);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]  };
  res.render("urls_show", templateVars);
});


