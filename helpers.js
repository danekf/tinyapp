  //generic search for a value, given a certain key, within a dataset, returns entire object for that element
  const getUserByValue = function(value, key, dataset) {
  
    for (let element in dataset) {
      if (value === dataset[element][key]) {
        //if value is found for parameter in the dataset
        return dataset[element];
      }
    }
    //if not found, return false
    return false;
    
  };





module.exports = {getUserByValue}