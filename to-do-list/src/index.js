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

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  return response.status(201).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { todos } = request.user;

  const todoObj = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date().toLocaleDateString('pt-BR'),
  };

  todos.push(todoObj);

  return response.status(201).json(todoObj);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { todos } = request.user;

  const userTodo = todos.find((todo) => todo.id === id);

  if (!userTodo) {
    return response.status(404).json({ error: 'To-to not found.' });
  }

  userTodo.title = title;
  userTodo.deadline = deadline;

  return response.status(201).json(userTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { todos } = request.user;

  const userTodo = todos.find((todo) => todo.id === id);

  if (!userTodo) {
    return response.status(404).json({ error: 'To-to not found.' });
  }

  userTodo.done = true;

  return response.status(201).json(userTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  const { id } = request.params;

  const todoExists = todos.some((todo) => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: 'To-do not found.' });
  }

  request.user.todos = todos.filter((todo) => todo.id !== id);

  return response.status(204).json()
});

module.exports = app;
