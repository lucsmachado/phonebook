const mongoose = require('mongoose');

const allowedParamNumbers = [3, 5];

if (!allowedParamNumbers.includes(process.argv.length)) {
  console.log(`ERROR: Missing parameters.
To list all entries in the phonebook:
$ node mongo.js <password>
To add a new entry:
$ node mongo.js <password> <name> <number>`);
  process.exit(1);
};

mongoose.connect(`mongodb+srv://fullstack:${process.argv[2]}@cluster0.d35w2.mongodb.net/phonebookApp?retryWrites=true&w=majority`);

const personSchema = new mongoose.Schema({
  name: String,
  number: String
});

const Person = new mongoose.model('Person', personSchema);

// Fetch all entries
if (process.argv.length === 3) {
  Person
    .find({})
    .then(result => {
      console.log('Phonebook:');

      result.forEach(person => {
        console.log(`${person.name} ${person.number}`);
      });

      mongoose.connection.close();
      process.exit(0);
    });
}

// Add new entry
if (process.argv[3] && process.argv[4]) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  });
  
  person
  .save()
  .then(result => {
    console.log(`Added ${result.name} number ${result.number} to phonebook`);
    mongoose.connection.close();
    process.exit(0);
  });
}