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
const winGameRoute = require('./routes/wingame');
const loseGameRoute = require('./routes/losegame')
const registerRoute = require('./routes/register');
const myprofileRoute = require('./routes/myprofile');
const createMatchRoute = require('./routes/creatematch');
const chatMessageRoute = require('./routes/chatmessage');
const searchUsersRoute = require('./routes/searchusers');
const unblockUserRoute = require('./routes/unblockuser');
const removeFriendRoute = require('./routes/removefriend');
const friendRequestRoute = require('./routes/friendrequest');
const blacklistUserRoute = require('./routes/blacklistuser');
const updateAccuracyRoute = require('./routes/updateaccuracy');
const createNotificationRoute = require('./routes/createnotification');
const deleteNotificationRoute = require('./routes/deletenotification');
const acceptFriendRequestRoute = require('./routes/acceptfriendrequest');
const rejectFriendRequestRoute = require('./routes/rejectfriendrequest');
const retrieveNotificationsRoute = require('./routes/retrievenotifications');

// Telling the app which route (declared above) to use in correspondance to a given localhost URL path
app.use('/', indexRoute);
app.use('/login', loginRoute);
app.use('/wingame', winGameRoute);
app.use('/losegame', loseGameRoute);
app.use('/register', registerRoute);
app.use('/myprofile', myprofileRoute);
app.use('/creatematch', createMatchRoute);
app.use('/chatmessage', chatMessageRoute);
app.use('/searchusers', searchUsersRoute);
app.use('/unblockuser', unblockUserRoute);
app.use('/removefriend', removeFriendRoute);
app.use('/friendrequest', friendRequestRoute);
app.use('/blacklistuser', blacklistUserRoute);
app.use('/updateaccuracy', updateAccuracyRoute);
app.use('/createnotification', createNotificationRoute);
app.use('/deletenotification', deleteNotificationRoute);
app.use('/acceptfriendrequest', acceptFriendRequestRoute);
app.use('/rejectfriendrequest', rejectFriendRequestRoute);
app.use('/retrievenotifications', retrieveNotificationsRoute);

// Setting up MatchMaking logic
var ready_players_list = new Array() // This list is updated with a new user when he clicks "ready up", sending a "readytoplay" emit
                                     // containing the user's data, along with the timestamp at which he clicked "ready up"

// Every 5 seconds, all the users in "ready" state are sorted based on their skill level and on the amount of time they've been
// waiting in queue to find a match. If the number of these users is odd, one gets put bat in the waiting list; all the other
// users are matched in pairs and are notified through Socket.io that their match is starting, so they can start loading their
// front-end resources.
setInterval(() => {
    const data = new Date() // Getting the current time
    timereadyusers = new Array() // Creating the array in which an even number of ready users will be paired up to play
  
    // Users that waited at least 10 seconds can be added to timereadyusers, the actual pair-making list:
    for(let i = 0; i < ready_players_list.length; i++){
      if(ready_players_list[i].readyuptime < data.getTime() - 5000){
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
}, 5000);

// List of matches that are currently been played; once a match is created, it gets added to this list. When it ends, it gets removed.
// This prevents the clients to constantly query up ongoing matches, which would overload the database with requests. Every 10 seconds,
// this list is sent to every client through an emit. When notified by both the winner and loser, the server removes the match from this list.
// If for some reason the two playing clients are unable to notify the server that the game is over, the match will be removed automatically if
// it's sarted more than 2.5 minutes before (estimated average time for a battleshipmatch is 2 minutes)
ongoing_matches = new Array() // {player1: String, player2: String, starttime: Date} with player1 and 2 not necessarily in alphabetical order
setInterval(() => {
  const current_time = new Date()
  // Deleting from the list all the matches that started more than 150 seconds ago
  for(let i = 0; i < ongoing_matches.length; i++){
    if(ongoing_matches[i].timestamp <= current_time.getTime() - 150000){
      ongoing_matches.splice(i, 1)
    }
  }
  // Sending to all the clients the new ongoing_matches list
  ios.emit('newongoingmatches', {message_type: 'newongoingmatches', ongoing_matches: ongoing_matches})
}, 10000)

// Setting up ship positioning confirmation
var confirmedpositonings = new Array()


//Setting up Socket.io server side (ios stands for IO Server)
ios.on('connection', (socket) => {
  //console.log("Socekt.io client connected with ID: ", socket.id)
  
  socket.on('startchat', (players) => {
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
    var readyguard = true
    for(let readyplayer of ready_players_list){
      if(readyplayer.username == player.username){
        readyguard = false
      }
    }
    if(readyguard){
      ready_players_list.push(player) 
    } 
  })

  // In case a user canceled the matchmaking, we remove it from the "ready_players_list"
  socket.on('cancelmatchmaking', (player) => {
    for(let j = 0; j < ready_players_list.length; j++){
      if(ready_players_list[j] == player){
        ready_players_list.splice(j, 1)
      }
    }
  })

  // When a match is created, we add it to the ongoing_matches list for other users to spectate it
  socket.on('matchcreated', (matchinfo) => {
    matchinfo.timestamp = new Date()
    ongoing_matches.push(matchinfo)
  })

  // When a user starts spectating two players, he asks them to send him their fields updated up to that moment
  socket.on('imspectatingyou', (players) => {
    socket.broadcast.emit('imspectatingyou'+players.player1, (players))
    socket.broadcast.emit('imspectatingyou'+players.player2, (players))
  })

  // When a match ends, we remove it to the ongoing_matches list so other users won't join in to spectate.
  // An ongoing match is identified by the names of the two players; since the usernames are unique, it's impossible
  // for two games between the two same players to exist and be played at the same time.
  socket.on('matchended', (matchinfo) => {
    for(let i = 0; i < ongoing_matches.length; i++){
      if((ongoing_matches[i].player1 == matchinfo.player1 && ongoing_matches[i].player2 == matchinfo.player2) || (ongoing_matches[i].player1 == matchinfo.player2 && ongoing_matches[i].player2 == matchinfo.player1)){
        ongoing_matches.splice(i, 1)
        break
      }
    }
    socket.broadcast.emit('matchended'+matchinfo.player1+matchinfo.player2, matchinfo)
  })

  // When a user confirms its ship positioning
  socket.on('confirmshippositioning', (positioning) => {
    var isalreadyin = false
    for(let i = 0; i < confirmedpositonings.length; i++){
      // If the enemy already told the server that he confirms his ship placement, an object like {current_user: ..., enemy: ...}
      // is already going to be present in the confirmedpositionings list; if this is the case, it means that both the enemy and
      // the current_user are ready to start the game using their chosen positioning.
      if(confirmedpositonings[i].current_user == positioning.enemy){
        isalreadyin = true
        positioning.message_type = 'enemyconfirmed'
        // Choosing randomly which user goes first
        var firstturn = Math.floor(Math.random() * 2);
        if(firstturn == 0){ positioning.firstturn = confirmedpositonings[i].current_user}
        else{ positioning.firstturn = confirmedpositonings[i].enemy}
        socket.broadcast.emit('yourenemyconfirmed'+confirmedpositonings[i].current_user, positioning)
        socket.emit('yourenemyconfirmed'+confirmedpositonings[i].enemy, positioning)
  
        var delete_index
        for(let j = 0; j < confirmedpositonings.length; j++){
          if(confirmedpositonings[j].current_user == positioning.enemy){
            delete_index = j
          }
        }
        delete(confirmedpositonings[delete_index])
        for(let j = delete_index; j < confirmedpositonings.length-1; j++){
          confirmedpositonings[j] = confirmedpositonings[j+1]
        }
        confirmedpositonings.length = confirmedpositonings.length - 1
      }
    }
    // If the enemy still hasn't confirmed his positioning, the current user will be added to the confirmedpositionings list
    if(!isalreadyin){
      confirmedpositonings.push(positioning)
    }
  })

  // When a player1 fires a shot against another player2, player2 gets notified
  socket.on('shotfired', (shot) => {
    shot.message_type = 'yougotshot'
    socket.broadcast.emit('yougotshot'+shot.fired_user, shot)
  })

  // When a player1 is shot at by a player2, player1 sends the shot result to player1
  socket.on('shotresult', (shotresult) => {
    socket.broadcast.emit('shotresult'+shotresult.firing_user, shotresult)
  })

  // When at the end of a match a player1 sends a rematch request to a player2
  socket.on('rematchrequest', (request) => {
    socket.broadcast.emit('enemywantsrematch'+request.receiver, request)
  })

  // When a player accepts the rematch request of the enemy after the end of a game
  socket.on('acceptrematch', (request) => {
    socket.broadcast.emit('enemyacceptedrematch'+request.receiver, request)
    socket.broadcast.emit('playersrematch'+request.sender, (request))
  })

  socket.on('enemytimedout', (timeoutinfo) => {
    socket.broadcast.emit('youtimedout'+timeoutinfo.enemy, timeoutinfo)
  })

  // When a player1 leaves the match, player2 gets notified and wins the game
  socket.on('matchleft', (leavenotification) => {
    socket.broadcast.emit('enemyleft'+leavenotification.enemy, leavenotification)
    socket.broadcast.emit('matchended'+leavenotification.current_user, {message_type: 'matchended'})    
  })

  // When a playertakes a shot, the spectators are notified with the new enemy field to show.
  // I.e. if player1 shoots at player2, then player2's field is updated with a miss or a hit and is sent to the spectators.
  socket.on('newenemyfieldshot', (message) => {
    socket.broadcast.emit('newenemyfieldshot'+message.player1+message.player2, message)
  })

  // When a player places or removes a ship during the positioning phase, the spectators are notified with the new field
  // and update their field views accordingly.
  socket.on('newfieldpositioning', (message) => {
    socket.broadcast.emit('newfieldpositioning'+message.player, message)
  })

  // When a player texts the other player in a match, the spectators are notified with that message (doesn't happen in private chats between friends)
  socket.on('newplayermessage', (message) => {
    socket.broadcast.emit('newplayermessage'+message.from, message)
  })

  // When a spectator sends a message, the other spectators are notified with that message
  socket.on('newspectatormessage', (message) => {
    socket.broadcast.emit('newspectatormessage'+message.player1+message.player2, message)
  })  

  // When a spectator sends a message, the other spectators are notified with that message
  socket.on('stoppedspectating', (spectator) => {
    socket.broadcast.emit('stoppedspectating'+spectator.spectator, spectator)
  })

  // When a user sends a message to another user who is currently offline (or doesn't have the chat open) or sends an invite to play,
  // a notification is sent
  socket.on('newnotification', (notification) => {
    socket.broadcast.emit('newnotification'+notification.user, notification)
  })

  // When a user accepts a friend's invite to play a match
  socket.on('acceptmatch', (inviteinfo) => {
    socket.broadcast.emit('matchinviteaccepted'+inviteinfo.accepted_user, inviteinfo)
  })

  // Alternative
  socket.on('availableformatch', (matchinfo) => {
    ios.emit('matchstarted'+matchinfo.user, { 
      message_type: 'yougotmatched',
      enemy: matchinfo.from,
      starttime: matchinfo.starttime
    })
  })

  // Alternative
  socket.on('notavailableformatch', (notification) => {
    console.log(notification)
    socket.broadcast.emit('friendnotavailable'+notification.user, {
      notification_type: 'friendnotavailable',
      user: notification.user,
      from: notification.from
    })
  })

  socket.on('disconnect', () => {
    //console.log("Client " + socket.id + " disconnected from Socket.io")
  })
})


// Server starts listening on port 3000
server.listen(port, () => {
  console.log('App listening on port', port)
})
