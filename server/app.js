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
const searchUsersRoute = require('./routes/searchusers');
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
app.use('/searchusers', searchUsersRoute)
app.use('/removefriend', removeFriendRoute);
app.use('/friendrequest', friendRequestRoute);
app.use('/blacklistuser', blacklistUserRoute);
app.use('/acceptfriendrequest', acceptFriendRequestRoute);
app.use('/rejectfriendrequest', rejectFriendRequestRoute);

// Setting up MatchMaking logic
var ready_players_list = new Array()


//Setting up Socket.io server side (ios stands for IO Server)
ios.on('connection', (socket) => {
  console.log("Socekt.io client connected with ID: ", socket.id)

  socket.on('chatstarted', (players) => {
    console.log('starting chat')
    socket.emit('openchat', players)
  })

  socket.on('newmessage', (message) => {
    console.log('Ho sentito il newmessage da: '+message.from+' a: '+message.to+ ' che ha scritto: '+ message.text_content)
    socket.emit('yousentmessage'+message.from, message)
    socket.broadcast.emit('youreceivedmessage'+message.to, message)
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
    var message = {
      request_type: "yougotaccepted",
      accepting_user: ""+newacceptedrequest.accepting_user
    }
    socket.broadcast.emit('yougotaccepted'+newacceptedrequest.accepted_user, message)
  })
  
  socket.on('newrejectedrequest', (newrejectedrequest) => {
    // Notifying the rejecting user's client so it can immediately update its component fields and localstorage
    socket.emit('rejectedrequest'+newrejectedrequest.rejecting_user, newrejectedrequest)
  })
  
  socket.on('newblockeduser', (newblock) => {
    // Notifying the blocking user's client so it can immediately update its component fields and localstorage
    socket.emit('blockeduser'+newblock.blocker, newblock)
  })

  socket.on('newdeletedfriend', (newdelete) => {
    // Notifying the deleting user's client so it can immediately update its component fields and localstorage
    socket.emit('deletedfriend'+newdelete.deleter, newdelete)
    // Notifying the deleted user's client so it can immediately update its component fields and localstorage
    socket.broadcast.emit('yougotdeleted'+newdelete.deleted,{
      request_type: 'yougotdeleted',
      deleter: newdelete.deleter
    })
  })

  socket.on('readytoplay', (player) => {
    ready_players_list.push(player) // Here we add the player that clicked on "ready up" to the "ready_players_list"
    console.log(ready_players_list)
    // Here we should sort the list based on their overall skill level

    // Here goes the logic for the matchup based on skill level

    // Here we delete the two players we chose to match up from the "ready_players_list" and then notify them
  })


  // In case a user canceled the matchmaking,remove it from the "ready_players_list"
  socket.on('cancelmatchmaking', (player) => {
    var playerindex = 0
    for(let j = 0; j < ready_players_list.length; j++){
      if(ready_players_list[j] == player){
        playerindex = j
        break
      }
    }
    console.log('PLAYERINDEX', playerindex)
    delete ready_players_list[playerindex]
    for(let i = playerindex; i < ready_players_list.length; i++){
      ready_players_list[i] = ready_players_list[i+1]
    }
    
    if(ready_players_list.length != 0){
      ready_players_list.length = ready_players_list.length -1
    }
    console.log('AFTER CANCELING', ready_players_list)
  })
  
  socket.on('disconnect', () => {
    console.log("Client " + socket.id + " disconnected from Socket.io")
  })
})


// Server starts listening on port 3000
server.listen(port, () => {
  console.log('App listening on port', port)
})
