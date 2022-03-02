const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(express.json());
app.use(morgan('tiny'));

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
  response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);

  if (!person) {
    response.statusMessage = `Person with id=${id} not found`;
    return response.status(404).end();
  }

  response.json(person);
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);
  response.status(204).end();
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

  if (nameIsDuplicate(body.name)) {
    return response
      .status(422)
      .json(
        {
          error: 'Property \'name\' must be unique'
        }
      );
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId()
  };
  persons = persons.concat(person);
  response.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})