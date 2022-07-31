//Con dotenv e la costante DB_CONNECTION che non carichiamo su GitHub teniamo nascoste le credenziali nella stringa di connessione al db su Atlas
require('dotenv/config');
const http = require('http');
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const server = http.createServer(app)
const port = 3000
const bodyParser = require('body-parser'); // Serve per il parsing in json del body delle request GET, POST, PUT, etc.
const io = require('socket.io')

const ios = io(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "Content-Length", "X-Requested-With", "cache-control"]
  }
});
module.exports = ios //esportiamo ios per le altre route

app.all('/*', (req, res, next) => {
  //Abilitiamo le policy CORS che altrimenti ci bloccherebbero il traffico in uscita
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, PATCH, *');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, cache-control');
  next();
})

app.use(bodyParser.json()); // Ogni volta che arriva una request ne trasformiamo il body in json


mongoose.connect(
  process.env.DB_CONNECTION, () => console.log("Connesso al db"),
  (err) => {
    if(err) console.log(err) 
    else console.log("mongdb is connected");
   });

//Dichiariamo tutte le route esistenti, per ora abbiamo fatto solo due esempi di login e register
const indexRoute = require('./routes/index');
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const myprofileRoute = require('./routes/myprofile');
const chatMessageRoute = require('./routes/chatmessage');
const friendRequestRoute = require('./routes/friendrequest');
const blacklistUserRoute = require('./routes/blacklistuser');
const acceptFriendRequestRoute = require('./routes/acceptfriendrequest');
const rejectFriendRequestRoute = require('./routes/rejectfriendrequest');


//Qui diciamo di utilizzare le route dichiarate prima in base a dove ci troviamo, se in /login o in /register in questo caso
app.use('/', indexRoute);
app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/myprofile', myprofileRoute);
app.use('/chatmessage', chatMessageRoute);
app.use('/friendrequest', friendRequestRoute);
app.use('/blacklistuser', blacklistUserRoute);
app.use('/acceptfriendrequest', acceptFriendRequestRoute);
app.use('/rejectfriendrequest', rejectFriendRequestRoute);


ios.on('connection', (socket) => {
  console.log("A Socket.io client connected", socket.id)
  socket.on('new message', (data) => {
    console.log('Dal server ho sentito la new message inviata dal client; il messaggio inviato è: ', data)
    socket.emit('message', data)
  })
})
ios.on('disconnect', () => {
  console.log("A client disconnected from Socket.io")
})

//Facciamo partire il server in ascolto sulla porta 3000
server.listen(port, () => {
  console.log('App listening on port', port)
})
