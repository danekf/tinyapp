//generic search for a value, given a certain key, within a dataset, returns entire object for that element
const getUserByValue = function(value, key, dataset) {
  
  for (let element in dataset) {
    if (value === dataset[element][key]) {
      
      return dataset[element];
    }
  }
 
  return false;
    
};

const generateRandomString = () => {
  let randomString = '';
  let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++) {
    let randomIndex = Math.floor(Math.random() * 36);
    randomString += possibleCharacters.charAt(randomIndex);
  }
  return randomString;
};





module.exports = {
  getUserByValue,
  generateRandomString
};