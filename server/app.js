require('dotenv/config');
const http = require('http');
const mongoose = require('mongoose')
const express = require('express')
const io = require('socket.io')
const bodyParser = require('body-parser');

const app = express()
const server = http.createServer(app)
const port = 3000


// Setting the Socket.io instance to listen on the localhost server and enabling CORS policies for it
const ios = io(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "Content-Length", "X-Requested-With", "cache-control"]
  }
});
// Enabling CORS policies for the app as well
app.all('/*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, PATCH, *');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, cache-control');
  next();
})

// Everytime the server receives a request from the client, the request gets parsed
app.use(bodyParser.json());

// Connecting the database to MongoDB Atlas service through the connection string stored in .env
mongoose.connect(
  process.env.DB_CONNECTION, () => console.log("Connected to Atlas Database"), (err) => {
     if(err){ console.log(err) } 
  }
);


// Declaring all existing routes
const indexRoute = require('./routes/index');
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const myprofileRoute = require('./routes/myprofile');
const createMatchRoute = require('./routes/creatematch');
const chatMessageRoute = require('./routes/chatmessage');
const searchUsersRoute = require('./routes/searchusers');
const removeFriendRoute = require('./routes/removefriend')
const friendRequestRoute = require('./routes/friendrequest');
const blacklistUserRoute = require('./routes/blacklistuser');
const acceptFriendRequestRoute = require('./routes/acceptfriendrequest');
const rejectFriendRequestRoute = require('./routes/rejectfriendrequest');

// Telling the app which route (declared above) to use in correspondance to a given localhost URL path
app.use('/', indexRoute);
app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/myprofile', myprofileRoute);
app.use('/creatematch', createMatchRoute);
app.use('/chatmessage', chatMessageRoute);
app.use('/searchusers', searchUsersRoute)
app.use('/removefriend', removeFriendRoute);
app.use('/friendrequest', friendRequestRoute);
app.use('/blacklistuser', blacklistUserRoute);
app.use('/acceptfriendrequest', acceptFriendRequestRoute);
app.use('/rejectfriendrequest', rejectFriendRequestRoute);

// Setting up MatchMaking logic
var ready_players_list = new Array() // This list is updated with a new user when he clicks "ready up", sending a "readytoplay" emit
                                     // containing the user's data, along with the timestamp at which he clicked "ready up"

// Every 10 seconds, all the users in "ready" state are sorted based on their skill level and on the amount of time they've been
// waiting in queue to find a match. If the number of these users is odd, one gets put bat in the waiting list; all the other
// users are matched in pairs and are notified through Socket.io that their match is starting, so they can start loading their
// front-end resources.
setInterval(() => {
    const data = new Date() // Getting the current time
    timereadyusers = new Array() // Creating the array in which an even number of ready users will be paired up to play
  
    // Users that waited at least 10 seconds can be added to timereadyusers, the actual pair-making list:
    for(let i = 0; i < ready_players_list.length; i++){
      if(ready_players_list[i].readyuptime < data.getTime() - 1000){
        timereadyusers.push(ready_players_list[i])
      }
    }
    // Removing those users from the original waiting queue
    for(let i = 0; i < timereadyusers.length; i++){
      ready_players_list = ready_players_list.filter((user) => user !== timereadyusers[i])
    }
    // Sorting the players based on skill level and on earlier ready-up time, so users that clicked on "ready up" earlier 
    // than others are given priority to play before them
    timereadyusers.sort((a, b) => (a.skill_level > b.skill_level) ? 1 : (a.skill_level == b.skill_level) ? ((a.readyuptime > b.readyuptime) ? 1 : -1) : -1 )
    
    // Keeping the players to an even number and reinserting the exceeding one in the waiting queue
    if(timereadyusers.length % 2 != 0){
      ready_players_list.push(timereadyusers[timereadyusers.length-1])
      timereadyusers.length -= 1
    }
  
    // Notifying the ready users, pair by pair, that their game is ready
    for(let i = 0; i < timereadyusers.length; i+=2){
      starttime = new Date()
      // notifying the first player of the pair and telling him that the enemy is the second one of the pair
      ios.emit('matchstarted'+timereadyusers[i].username, { 
        message_type: 'yougotmatched',
        enemy: timereadyusers[i+1].username,
        creatematchprio: true, // this client is the one who's going to POST the server to create a new match
        starttime: starttime
      })
      // notifying the second player of the pair and telling him that the enemy is the first one of the pair
      ios.emit('matchstarted'+timereadyusers[i+1].username, {
        message_type: 'yougotmatched',
        enemy: timereadyusers[i].username,
        creatematchprio: false, // this client is NOT going to POST the server to create a new match
        starttime: starttime
      })
    }  
}, 10000);


//Setting up Socket.io server side (ios stands for IO Server)
ios.on('connection', (socket) => {
  console.log("Socekt.io client connected with ID: ", socket.id)
  
  socket.on('chatstarted', (players) => {
    console.log('starting chat')
    socket.emit('openchat', players)
  })

  socket.on('newmessage', (message) => {
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

  // When a user is ready to play, we add him to the ready_players_list, which is the waiting queue
  socket.on('readytoplay', (player) => {
    ready_players_list.push(player) 
  })

  // In case a user canceled the matchmaking, we remove it from the "ready_players_list"
  socket.on('cancelmatchmaking', (player) => {
    var playerindex = 0
    for(let j = 0; j < ready_players_list.length; j++){
      if(ready_players_list[j] == player){
        playerindex = j
        break
      }
    }
    delete ready_players_list[playerindex]
    for(let i = playerindex; i < ready_players_list.length; i++){
      ready_players_list[i] = ready_players_list[i+1]
    }    
    if(ready_players_list.length != 0){
      ready_players_list.length = ready_players_list.length -1
    }
  })
  
  socket.on('disconnect', () => {
    console.log("Client " + socket.id + " disconnected from Socket.io")
  })
})


// Server starts listening on port 3000
server.listen(port, () => {
  console.log('App listening on port', port)
})
