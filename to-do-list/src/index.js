const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

const checksExistsUserAccount = (request, response, next) => {
  const username = request.body.username
    ? request.body.username
    : request.headers.username;

  const userExists = users.find((user) => user.username === username);

  if (!userExists) {
    return response.status(400).json({ error: 'User not found.' });
  }

  request.user = userExists;

  return next();
};

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: 'User already exists.' });
  }

  const userObj = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(userObj);

  return response.status(201).json(userObj);
});

module.exports = app;
