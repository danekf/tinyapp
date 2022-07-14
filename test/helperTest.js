const { assert } = require('chai');

const { getUserByValue } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByValue("user@example.com", "email", testUsers);
    
    const expectedUserID = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };
    
    assert.deepEqual(user, expectedUserID);

  });
});

describe('getUserByEmail', function() {
  it('should return false if email does not exist', function() {
    const user = getUserByValue("user57@example.com", "email", testUsers);
    const expectedUserID = false;
    
    assert.deepEqual(user, expectedUserID);
  });
});

