const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs"); // set template enmjine as ejs
const cookieParser = require('cookie-parser'); //require cookie parser for cookies

/////////////////////
//Global Objects
/////////////////////

//url database
const urlDatabase = {
  //id: longURL
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//users object, yeah this is not the best way to do it.
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "no",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


/////////////////////
//Global functions
/////////////////////

function generateRandomString() {
  let randomString = '';
  let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++) {
    let randomIndex = Math.floor(Math.random() * 36);
    randomString += possibleCharacters.charAt(randomIndex);
  }
  return randomString;
}

const lookupUsersValue = function(value, parameter){

  for(let element in users){
    if(value === users[element][parameter]){
      //if value is found for parameter in the dataset     
      return users[element];
    }
  }
  //if not found, return false
  return false
  
}

const userLoginCheck = (typedEmail, passwordHash) => {

  const user = lookupUsersValue(typedEmail, "email");

  if (!user) {
    return {Err: "403, email not registered", data: null};
  }
  if(user.password !== passwordHash){
    return {Err: "Incorrect Password", data: null};
  }

  return {Err: null, user};
  
}



///////////////
//Server start
///////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

////////////////////////////////////
//Magic words to make things work (middleware)
////////////////////////////////////

//Getting ready for POST requests, allows for use of objects in req.body as an example. Without these magic words it just wont work.
app.use(express.urlencoded({ extended: true }));
//user cookie parser so cookies work
app.use(cookieParser());


//////
const morgan = require('morgan');
const e = require("express");
//app.use(morgan('dev'));




/////////////////
//Posts
/////////////////

//create new short URL with link, then redirect to home
app.post("/urls", (req, res) => {
  if(!req.cookies["userId"]){
    return res.send("Please Log in to shorted URLS"); 
  }

  console.log(req.body); // Log the POST request body to the console
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

//register new user
app.post("/register", (req, res) => {
  let newEmail = req.body.email;
  let newPassword = req.body.password;
  let newId = generateRandomString();

  if(newEmail === '' || newPassword === '' ){
    res.send("HTTP Error 400, blank email or password");
  }

  //if email is already registered, send to error message, else do nothing.
  lookupUsersValue(newEmail, "email") ? res.send("Error 400, email already registered") : null ;


  // //have to create a new blank users[newID] with the objects beneath it or its not working...
  users[newId] = {
    id: '',
    email: '',
    password: ''

  };
  //set new values for new ID
  users[newId].id = newId;
  users[newId].email = newEmail;
  users[newId].password = newPassword;

  //set cookie with new user_id
  res.cookie("userId", newId);
  res.redirect(`/urls`);
});

//Edit URL for existing id
app.post("/urls/:id", (req, res) => {
  const {id} = req.params.id;

  urlDatabase[id] = req.body.longURL;
  res.redirect('/urls');
});

//detele button on urls_index
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect(`/urls`); //send us to the URL index page again
  
});

//log in
app.post("/login", (req, res) => {
  //set sername and password from login page
  const {email , password} = req.body;
  //check username and password combo, if not found, send to error
  const {Err, user} = userLoginCheck(email, password);

 if(Err){
  return res.send(Err);
 }
  res.cookie('userId', user.id);  
  res.redirect("/urls");

});


//logout for user
app.post("/logout", (req, res) => {
  //clear cookie
  res.clearCookie("userId");
  res.redirect("/urls");
});




/////////////////
//Routes
/////////////////
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/login", (req, res) => {
  //if logged in, redirect to URLS
  if(req.cookies["userId"]){
    return res.redirect("/urls"); 
  }
  const templateVars = {user: users[req.cookies["userId"]], urls: urlDatabase };
  res.render("urls_login", templateVars);
});

app.get("/urls", (req, res) => {

    //if not logged in, redirect to login
    if(!req.cookies["userId"]){
      return res.redirect("/login"); 
    }
  
  const templateVars = {user: users[req.cookies["userId"]], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {

  //if not logged in, redirect to login
  if(!req.cookies["userId"]){
    return res.redirect("/login"); 
  }

  const templateVars = {user: users[req.cookies["userId"]]} 
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  //if logged in, redirect to URLS
  if(req.cookies["userId"]){
    return res.redirect("/urls"); 
  }
  const templateVars = {user: users[req.cookies["userId"]]};
  res.render("urls_register", templateVars);
});


app.get("/u/:id", (req, res) => {
  res.redirect(urlDatabase[req.params.id]);
});

app.get("/urls/:id", (req, res) => {

  let id = req.params.id

  if(!urlDatabase.hasOwnProperty(id)){
    res.send("This shortened URL ID is not in the database")
  }

  const templateVars = {user: users[req.cookies["userId"]], id: req.params.id, longURL: urlDatabase[req.params.id]  };
  res.render("urls_show", templateVars);
});


