require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

morgan.token('request-body', (request, response) => JSON.stringify(request.body));

const app = express();

app.use(cors());
app.use(express.static('build'));
app.use(express.json());
app.use(morgan((tokens, request, response) => {
  const format = [
    tokens.method(request, response),
    tokens.url(request, response),
    tokens.status(request, response),
    tokens.res(request, response, 'content-length'),
    '-',
    tokens['response-time'](request, response),
    'ms'
  ];

  return tokens.method(request, response) === 'POST'
    ? format.concat(tokens['request-body'](request, response)).join(' ')
    : format.join(' ');
}));

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
];

app.get('/', (request, response) => {
  response.send('<h1>Phonebook</h1>');
});

app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has ${persons.length} entries<br>${new Date()}</p>`);
});

app.get('/api/persons', (request, response) => {
  Person
    .find({})
    .then(persons => {
      response.json(persons);
    });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person
    .findById(request.params.id)
    .then(person => {
      if (!person) {
        response.statusMessage = `Person with id=${request.params.id} not found`;
        return response.status(404).end();
      }
      
      response.json(person);
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

const nameIsDuplicate = (name) => {
  return persons.some(person =>
    person.name.localeCompare(name, undefined, { sensitivity: 'base' }) === 0
  );
};

const generateId = () => {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
};

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response
      .status(400)
      .json(
        {
          error: 'Missing properties \'name\' and / or \'number\' of person'
        }
      );
  }

  /* if (nameIsDuplicate(body.name)) {
    return response
      .status(422)
      .json(
        {
          error: 'Property \'name\' must be unique'
        }
      );
  } */

  const person = new Person({
    name: body.name,
    number: body.number
  });

  person
    .save()
    .then(savedPerson => {
      response.json(savedPerson);
    });
});

app.put('/api/persons/:id', (request, response, next) => {
  const replacementPerson = {
    name: request.body.name,
    number: request.body.number
  };

  Person
    .findByIdAndUpdate(request.params.id, replacementPerson, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson);
    })
    .catch(error => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Unknown endpoint' });
}

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformed id' });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})