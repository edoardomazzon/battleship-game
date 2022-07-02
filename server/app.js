//Con dotenv e la costante DB_CONNECTION che non carichiamo su GitHub teniamo nascoste le credenziali nella stringa di connessione al db su Atlas
require('dotenv/config');

const express = require('express')
const mongoose = require('mongoose')
const app = express()
const port = 3000
const bodyParser = require('body-parser'); // Serve per il parsing in json del body delle request GET, POST, PUT, etc.


app.use(bodyParser.json()); // Ogni volta che arriva una request ne trasformiamo il body in json

mongoose.connect(process.env.DB_CONNECTION, () => console.log('Connesso al db'));//Utilizziamo DB_CONNECTION da .env (dotenv)

//Dichiariamo tutte le route esistenti, per ora abbiamo fatto solo due esempi di login e register
const indexRoute = require('./routes/index');
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');

//Qui diciamo di utilizzare le route dichiarate prima in base a dove ci troviamo, se in /login o in /register in questo caso
app.use('/', indexRoute);
app.use('/login', loginRoute);
app.use('/register', registerRoute);


//Facciamo partire il server in ascolto sulla porta 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})