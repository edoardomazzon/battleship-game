require('dotenv/config');
const http = require('http');
const mongoose = require('mongoose')
const express = require('express')
const io = require('socket.io')
const bodyParser = require('body-parser');

const app = express()
const server = http.createServer(app)
const port = 3000


//Setting the Socket.io instance to listen on the localhost server and enabling CORS policies for it
const ios = io(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "Content-Length", "X-Requested-With", "cache-control"]
  }
});
//Enabling CORS policies for the app as well
app.all('/*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, PATCH, *');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, cache-control');
  next();
})

//Everytime the server receives a request from the client, the request gets parsed
app.use(bodyParser.json());

//Connecting the database to MongoDB Atlas service through the connection string stored in .env
mongoose.connect(
  process.env.DB_CONNECTION, () => console.log("Connected to Atlas Database"),
  (err) => {
    if(err) console.log(err) 
    else console.log("mongdb is connected");
   });


//Declaring all existing routes
const indexRoute = require('./routes/index');
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const myprofileRoute = require('./routes/myprofile');
const chatMessageRoute = require('./routes/chatmessage');
const removeFriendRoute = require('./routes/removefriend')
const friendRequestRoute = require('./routes/friendrequest');
const blacklistUserRoute = require('./routes/blacklistuser');
const acceptFriendRequestRoute = require('./routes/acceptfriendrequest');
const rejectFriendRequestRoute = require('./routes/rejectfriendrequest');

//Telling the app which route (declared above) to use in correspondace to a given localhost URL path
app.use('/', indexRoute);
app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/myprofile', myprofileRoute);
app.use('/chatmessage', chatMessageRoute);
app.use('/removefriend', removeFriendRoute);
app.use('/friendrequest', friendRequestRoute);
app.use('/blacklistuser', blacklistUserRoute);
app.use('/acceptfriendrequest', acceptFriendRequestRoute);
app.use('/rejectfriendrequest', rejectFriendRequestRoute);


//Setting up Socket.io server side (ios stands for IO Server)
ios.on('connection', (socket) => {
  console.log("Socekt.io client connected with ID: ", socket.id)

  socket.on('new message', (data) => {
    socket.emit('message', data)
  })
  
  socket.on('newfriendrequest', (friendrequest) =>{
    // Notifying the request receiver's client so that it can immediately update its pending requests list without having
    // to query the database. We use BROADCAST since we need to notify other sockets and not ours.
    socket.broadcast.emit('friendrequest'+friendrequest.receiver, friendrequest) 
  })

  socket.on('newacceptedrequest', (newacceptedrequest) => {
    // Notifying the accepter to update its client data
    socket.emit('acceptedrequest'+newacceptedrequest.accepting_user, newacceptedrequest)
    // Notifying the accepted user to update its client
    socket.broadcast.emit('yougotaccepted'+newacceptedrequest.accepted_user, { 
      request_type: 'yougotaccepted',
      accepting_user: ''+newacceptedrequest.accepting_user
    })
  })
  
  socket.on('newrejectedrequest', (newrejectedrequest) => {
    // Notifying the rejecting user's client so it can immediately update its component fields and localstorage
    socket.emit('rejectedrequest'+newrejectedrequest.rejecting_user, newrejectedrequest)
  })
  
  socket.on('newblockeduser', (newblock) => {
    // Notifying the blocking user's client so it can immediately update its component fields and localstorage
    socket.emit('blockeduser'+newblock.blocker, newrejectedrequest)
  })

  socket.on('newdeletedfriend', (deleterequest) => {
    // Notifying the deleting user's client so it can immediately update its component fields and localstorage
    socket.emit('deletedfriend'+deleterequest.deleter, deleterequest)
    // Notifying the deleted user's client so it can immediately update its component fields and localstorage
    socket.broadcast.emit('yougotdeleted'+deleterequest.deleted,{
      request_type: 'yougotdeleted',
      deleter: deleterequest.deleter
    })
  })
  
  socket.on('disconnect', () => {
    console.log("Client " + socket.id + " disconnected from Socket.io")
  })
})


// Server starts listening on port 3000
server.listen(port, () => {
  console.log('App listening on port', port)
})
