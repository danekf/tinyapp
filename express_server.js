const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs"); // set template enmjine as ejs
const cookieParser = require('cookie-parser'); //require cookie parser for cookies
const cookieSession = require('cookie-session');//require cookie session for secure cookies
//bcrypt stuff
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

/////////////////////
//Global Objects
/////////////////////

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "userRandomID"
  },

  "9sm5xK": {
    longURL: "www.google.com",
    userId: "user2RandomID"
  },
};

//users object, yeah this is not the best way to do it.
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("no", salt),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", salt)
  },
};

/////////////////////
//Global functions
/////////////////////

const {getUserByValue, generateRandomString} = require('./helpers.js');

const userLoginCheck = (typedEmail, password) => {
  const usersObj = users;
  
  const user = getUserByValue(typedEmail, "email", usersObj);

  if (!user) {
    return {Err: "403, email not registered", data: null};
  }
  //Iff password hashes DO NOT match, return error.
  if (!bcrypt.compareSync(password, user.password)) {
    return {Err: "Incorrect Password", data: null};
  }

  return {Err: null, user};
  
};

//return object with user owned URLS

const urlsForUser = (id) => {
  const ownedURLS = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === id) {
      ownedURLS[shortURL] = urlDatabase[shortURL];
    }
  }
  return ownedURLS;
};



////////////////////////////////////
//Magic words to make things work (middleware)
////////////////////////////////////

//Getting ready for POST requests, allows for use of objects in req.body as an example. Without these magic words it just wont work.
app.use(express.urlencoded({ extended: true }));
//user cookie parser so cookies work
app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: ["A happy little grapefruit", "Friends stay friends forever"],
    

  })
);
 
/////////////////
//Routes
/////////////////
//main redirect if nothing specified
app.get("/", (req, res) => {
  //redirect user if they just try to open localhost/port  
 res.redirect("/urls")
});
  
//register new user
app.get("/register", (req, res) => {
  //if logged in, redirect to URLS
  if (req.session.userId) {
    return res.redirect("/urls");
  }
  const templateVars = {user: users[req.session.userId]};
  res.render("urls_register", templateVars);
});
app.post("/register", (req, res) => {
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  const encryptedPassword = bcrypt.hashSync(newPassword, salt);
  const newId = generateRandomString();
    
  if (newEmail === '' || newPassword === '') {
    res.send("HTTP Error 400, blank email or password");
  }
  
  //if email is already registered, send to error message, else do nothing.
  getUserByValue(newEmail, "email", users) ? res.send("Error 400, email already registered") : null;
  
  
  // //have to create a new blank users[newID] with the objects beneath it or its not working...
  users[newId] = {
    id: '',
    email: '',
    password: ''
    
  };
  //set new values for new ID
  users[newId].id = newId;
  users[newId].email = newEmail;
  users[newId].password = encryptedPassword;
  
  //set cookie with new user_id
  req.session.userId = newId;
  res.redirect(`/urls`);
});

//log in
app.get("/login", (req, res) => {
  //if logged in, redirect to URLS
  if (req.session.userId) {
    return res.redirect("/urls");
  }
  const templateVars = {user: users[req.session.userId], urls: urlDatabase };
  res.render("urls_login", templateVars);
});
app.post("/login", (req, res) => {
  //set sername and password from login page
  const {email , password} = req.body;
  //check username and password combo, if not found, send to error
      
  const {Err, user} = userLoginCheck(email, password);
  
  if (Err) {
    return res.send(Err);
  }
  req.session.userId = user.id;
  res.redirect("/urls");
  
});

//logout for user
app.post("/logout", (req, res) => {
  //clear cookie
  req.session.userId = null;
  res.redirect("/urls");
});


//MY URLS page
app.get("/urls", (req, res) => {
  
  //if not logged in, redirect to login
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  
  const usersURLs = urlsForUser(req.session.userId);
  
  const templateVars = {user: users[req.session.userId], urls: usersURLs };
  
  res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {
  //login check for creating shorter urls
  if (!req.session.userId) {
    return res.send("Please Log in to see shortened URLS");
  }
    
  let id = generateRandomString();
  urlDatabase[id] = {
    longURL: '',
    userId: ''
  };
    
  urlDatabase[id].longURL = req.body.longURL;
  urlDatabase[id].userId = req.session.userId;
    
  res.redirect(`/urls/${id}`);
    
});

//Create new URL
app.get("/urls/new", (req, res) => {
    
  //if not logged in, redirect to login
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  
  const templateVars = {user: users[req.session.userId]};
  res.render("urls_new", templateVars);
});

//Edit URL for existing id
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  
  urlDatabase[id].longURL = req.body.longURL;
  res.redirect('/urls');
});
app.get("/urls/:id", (req, res) => {
  
  const id = req.params.id;

  if (!urlDatabase.hasOwnProperty(id)) {
    res.send("This shortened URL ID is not in the database");
  }
  //login if not logged in
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  //cannot edit if not owner
  if (req.session.userId !== urlDatabase[id].userId) {
    return res.send("You do not have permission to edit this entry");
  }

  const templateVars = {user: users[req.session.userId], id: req.params.id, longURL: urlDatabase[req.params.id].longURL  };
  res.render("urls_show", templateVars);
});

//detele created shortened URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  
  delete urlDatabase[id];
  res.redirect(`/urls`); //send us to the URL index page again
  
});


//link to longURL
app.get("/u/:id", (req, res) => {
  console.log(req.params.id);
  console.log(urlDatabase[req.params.id]);
  res.redirect(urlDatabase[req.params.id].longURL);
});

///////////////
//Server start
///////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


module.exports = {salt}