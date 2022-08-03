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


//Setting up Socket.io server side (ios stands for Io Server)
ios.on('connection', (socket) => {
  console.log("Socekt.io client connected with ID: ", socket.id)

  socket.on('new message', (data) => {
    socket.emit('message', data)
  })
  
  socket.on('newfriendrequest', (friendrequest) =>{
    console.log('HO SENTITO LA newfriendrequest INVIATA DA '+ friendrequest.sender + 'A '+ friendrequest.receiver)
    console.log('FACCIO LA EMIT DI friendrequest'+friendrequest.receiver)
    socket.broadcast.emit('friendrequest'+friendrequest.receiver, friendrequest) //Avvisiamo chi ha ricevuto la richiesta così che aggiorni la sua pending list 
                                                                       //in tempo reale senza dover fare di nuovo la query a db
  })

  socket.on('newacceptedrequest', (newacceptedrequest) => {
    socket.emit('acceptedrequest'+newacceptedrequest.accepting_user, newacceptedrequest)//Avvisiamo chi accetta che deve aggiornare la sua component
    socket.broadcast.emit('yougotaccepted'+newacceptedrequest.accepted_user, { //uso broadcast così la emit non arriva a me stesso, è un controllo in più
      request_type: 'yougotaccepted',
      accepting_user: ''+newacceptedrequest.accepting_user
    })//Avvsiamo chi è stato accettato di aggiornare la sua component
  })
  
  socket.on('newrejectedrequest', (newrejectedrequest) => {
    socket.emit('rejectedrequest'+newrejectedrequest.rejecting_user, newrejectedrequest)
  })
  
  socket.on('newblockeduser', (newblock) => {
    socket.emit('blockeduser'+newblock.blocker, newrejectedrequest)
  })
  
  socket.on('disconnect', () => {
    console.log("Client " + socket.id + " disconnected from Socket.io")
  })

})


//Facciamo partire il server in ascolto sulla porta 3000
server.listen(port, () => {
  console.log('App listening on port', port)
})
