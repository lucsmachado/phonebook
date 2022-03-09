const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGODB_URI)
  .then(result => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, 'Name \'{VALUE}\' is too short. Minimum length is 3'],
    required: [true, 'Missing name'],
    unique: true
  },
  number: {
    type: String,
    minLength: [8, 'Number is too short. Minimum length is 8'],
    required: [true, 'Missing phone number'],
    validate: {
      validator: (value) => {
        return /\d{8,}|\d{2,3}-\d{5,}/.test(value);
      },
      message: (props) => `${props.value} is not a valid phone number`
    }
  }
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Person', personSchema);