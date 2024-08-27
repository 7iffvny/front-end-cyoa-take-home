const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const DataAccessObject = require('./dataAccessObject');
const Comment = require('./comment');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dataAccessObject = new DataAccessObject('./database.sqlite3');
const comment = new Comment(dataAccessObject);

comment.createTable().catch(error => {
  console.log(`Error: ${JSON.stringify(error)}`);
});

// track connected clients
const clients = [];

// notify connected clients about a new comment
const notifyClients = (newComment) => {
  clients.forEach(client => {
    client.write(`data: ${JSON.stringify(newComment)}\n\n`);
  });
};

app.post('/createComment', function(request, response) {
  const { body } = request;
  comment.createComment(body).then(result => {
    notifyClients({ id: result.lastID, ...body, created: new Date().toISOString() });
    response.send(result);
  }).catch(error => {
    response.status(500).send({ error: error.message });
  });
});

app.get('/getComment', function(request, response) {
  const { body } = request;
  const { id } = body;
  comment.getComment(id).then(result => {
    response.send(result);
  }).catch(error => {
    response.status(500).send({ error: error.message });
  });
});

app.get('/getComments', function(request, response) {
  comment.getComments().then(result => {
    response.send(result);
  }).catch(error => {
    response.status(500).send({ error: error.message });
  });
});

// Delete a single comment
app.delete('/deleteComment/:id', function(request, response) {
  const { id } = request.params;
  comment.deleteComment(id).then(result => response.send(result))
  .catch(error => {
    response.status(500).send({ error: error.message });
  });
});

app.delete('/deleteComments', function(request, response) {
  comment.deleteComments().then(result => {
    response.send(result);
  }).catch(error => {
    response.status(500).send({ error: error.message });
  });
});

// endpoint event
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // create a new client object
  const clientId = Date.now();
  const client = {
    id: clientId,
    write: (data) => res.write(data),
  };

  clients.push(client);

  // remove client when connection is closed
  req.on('close', () => {
    clients.splice(clients.findIndex(c => c.id === clientId), 1);
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
app.use(express.static('public'));
app.get('/', function(request, response) {
  const rootDir = __dirname.replace('/server', '');
  response.sendFile(`${rootDir}/src/index.html`);
});
