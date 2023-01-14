export {};
import 'dotenv/config'
import {createServer} from 'http';
import express = require("express");
const app = express()
const server = createServer(app)
const port = 3000


// Setting the Socket.io instance to listen on the localhost server and enabling CORS policies for it
import {Server} from 'socket.io';
const ios = new Server(server, {
  cors: {
    origin: "*", // ["http://192.168.1.44:4200", "http://10.0.2.16:4200", "http://192.168.1.44:8100"]
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
import {json} from 'body-parser';
app.use(json());

// Connecting the database to MongoDB Atlas service through the connection string stored in .env
import mongoose from 'mongoose';
const dbstring = process.env.DB_CONNECTION
if(dbstring != undefined){
  mongoose.connect(dbstring, (err) => {
       if(err){ console.log(err) } 
    }
  );
}



// Declaring and importing all existing routes
import loginRoute from './routes/login';
import winGameRoute from './routes/wingame';
import loseGameRoute from './routes/losegame';
import registerRoute from './routes/register';
import userInfoRoute from './routes/userinfo';
import myprofileRoute from './routes/myprofile';
import createMatchRoute from './routes/creatematch';
import chatMessageRoute from './routes/chatmessage';
import searchUsersRoute from './routes/searchusers';
import unblockUserRoute from './routes/unblockuser';
import removeFriendRoute from './routes/removefriend';
import friendRequestRoute from './routes/friendrequest';
import blacklistUserRoute from './routes/blacklistuser';
import updateAccuracyRoute from './routes/updateaccuracy';
import adminDashboardRoute from './routes/admindashboard';
import createNotificationRoute from './routes/createnotification';
import deleteNotificationRoute from './routes/deletenotification';
import acceptFriendRequestRoute from './routes/acceptfriendrequest';
import rejectFriendRequestRoute from './routes/rejectfriendrequest';
import retrieveNotificationsRoute from './routes/retrievenotifications';

// Telling the app which route (declared above) to use in correspondance to a given localhost URL path
app.use('/login', loginRoute);
app.use('/wingame', winGameRoute);
app.use('/losegame', loseGameRoute);
app.use('/register', registerRoute);
app.use('/userinfo', userInfoRoute);
app.use('/myprofile', myprofileRoute);
app.use('/creatematch', createMatchRoute);
app.use('/chatmessage', chatMessageRoute);
app.use('/searchusers', searchUsersRoute);
app.use('/unblockuser', unblockUserRoute);
app.use('/removefriend', removeFriendRoute);
app.use('/friendrequest', friendRequestRoute);
app.use('/blacklistuser', blacklistUserRoute);
app.use('/updateaccuracy', updateAccuracyRoute);
app.use('/admindashboard', adminDashboardRoute);
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
    var timereadyusers = new Array() // Creating the array in which an even number of ready users will be paired up to play
  
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
      var starttime = new Date()
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

/*
List of matches that are currently been played; once a match is created, it gets added to this list. When it ends, it gets removed.
This prevents the clients to constantly query up ongoing matches, which would overload the database with requests. Every 10 seconds,
this list is sent to every client through an emit. When notified by both the winner and loser, the server removes the match from this list.
If for some reason the two playing clients are unable to notify the server that the game is over, the match will be removed automatically if
it's sarted more than 2.5 minutes before (estimated average time for a battleshipmatch is 2 minutes)
*/
var ongoing_matches = new Array() // list of {player1: String, player2: String, starttime: Date} with player1 and 2 not necessarily in alphabetical order
setInterval(() => {
  const current_time = new Date()
  // Deleting from the list all the matches that started more than 150 seconds ago
  for(let i = 0; i < ongoing_matches.length; i++){
    if(ongoing_matches[i].timestamp <= current_time.getTime() - 150000){
      ongoing_matches.splice(i, 1)
    }
  }
  // Sending the new ongoing_matches list to all the clients
  ios.emit('newongoingmatches', {message_type: 'newongoingmatches', ongoing_matches: ongoing_matches})
}, 10000)

// Setting up ship positioning confirmation
var confirmedpositionings = new Array()


//Setting up Socket.io server side (ios stands for IO Server)
ios.on('connection', (socket) => {
  
  // Telling the chat component to show the chat in the HTML section
  socket.on('startchat', (players) => {
    // Since this emit is not "broacasted", only the same Client Socket can hear it
    socket.emit('openchat', players)
  })

  // A new chat message is sent from a user to another
  socket.on('newmessage', (message) => {
    socket.broadcast.emit('youreceivedmessage'+message.to, message)
  })

  // The chat message recipient confirms that he read the message as he was in the chat
  socket.on('confirmreception', (sender) => {
    socket.broadcast.emit('yourmessagereceived'+sender.sender, {message_type: 'yourmessagereceived'})
  })

  // Sending a friend request
  socket.on('newfriendrequest', (friendrequest) =>{
    socket.broadcast.emit('friendrequest'+friendrequest.receiver, friendrequest)
  })

  // Accepting a friend request and notify the accepted user to update its client's "friend_list" by adding the accepter
  socket.on('newacceptedrequest', (newacceptedrequest) => {    
    var message = {
      request_type: "yougotaccepted",
      accepting_user: ""+newacceptedrequest.accepting_user
    }
    socket.broadcast.emit('yougotaccepted'+newacceptedrequest.accepted_user, message)
  })

  // Notifying the deleted friend's client so it can immediately update its component fields and localstorage
  socket.on('deletefriend', (newdelete) => {
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

  // When a client loads up a game, he also needs to close all the menus and not be able to open them until the game ends or they leave the match
  socket.on('closeheadermenus', (notification) => {
    socket.broadcast.emit('newnotification'+notification.user, notification)
  })

  // When a client leves or ends a game, he can open his header menus back
  socket.on('openheadermenus', (notification) => {
    socket.broadcast.emit('newnotification'+notification.user, notification)
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
    console.log(confirmedpositionings)
    var isalreadyin = false
    for(let i = 0; i < confirmedpositionings.length; i++){
      // If the enemy already told the server that he confirms his ship placement, an object like {current_user: ..., enemy: ...}
      // is already going to be present in the confirmedpositionings list; if this is the case, it means that both the enemy and
      // the current_user are ready to start the game using their chosen positioning.
      if(confirmedpositionings[i].current_user == positioning.enemy){
        isalreadyin = true
        positioning.message_type = 'enemyconfirmed'
        // Choosing randomly which user goes first
        var firstturn = Math.floor(Math.random() * 2);
        if(firstturn == 0){ positioning.firstturn = confirmedpositionings[i].current_user}
        else{ positioning.firstturn = confirmedpositionings[i].enemy}
        socket.broadcast.emit('yourenemyconfirmed'+confirmedpositionings[i].current_user, positioning)
        socket.emit('yourenemyconfirmed'+confirmedpositionings[i].enemy, positioning)
  
        var delete_index
        for(let j = 0; j < confirmedpositionings.length; j++){
          if(confirmedpositionings[j].current_user == positioning.enemy){
            delete_index = j
          }
        }
        if(delete_index){
          delete(confirmedpositionings[delete_index])
          for(let j = delete_index; j < confirmedpositionings.length-1; j++){
            confirmedpositionings[j] = confirmedpositionings[j+1]
          }
          confirmedpositionings.length = confirmedpositionings.length - 1
        }        
      }
    }
    // If the enemy still hasn't confirmed his positioning, the current user will be added to the confirmedpositionings list
    if(!isalreadyin){
      confirmedpositionings.push(positioning)
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

  // When a user sends a notification to another user
  socket.on('newnotification', (notification) => {
    socket.broadcast.emit('newnotification'+notification.user, notification)
  })

  // When a user accepts a friend's invite to play a match
  socket.on('acceptmatch', (inviteinfo) => {
    socket.broadcast.emit('matchinviteaccepted'+inviteinfo.accepted_user, inviteinfo)
  })

  // When a friend accepts a match request, the requester has to tell him if he's still available or if he already is in queue/started another game.
  // If the request receiver accepts and the sender tells him that he's available, the match starts:
  socket.on('availableformatch', (matchinfo) => {
    ios.emit('matchstarted'+matchinfo.user, { 
      message_type: 'yougotmatched',
      enemy: matchinfo.from,
      starttime: matchinfo.starttime
    })
  })

  socket.on('disconnect', () => {
    //console.log("Client " + socket.id + " disconnected from Socket.io")
  })
})


// Server starts listening on port 3000
server.listen(port)
