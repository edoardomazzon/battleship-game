import { Component, HostListener, OnInit } from '@angular/core';
import { FriendRequest } from '../models/friend-request';
import { MatchmakingService } from '../services/matchmaking.service';
import { FriendRequestService } from '../services/friend-request.service';
// import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})

export class HomeComponent implements OnInit {
  // public baseURL = `http://${environment.ip_address}:3000/`
  public isready = false
  public isplaying: Boolean
  public isspectating: Boolean
  public current_user: any
  public ongoing_matches: any
  public recently_played: Array<any>
  public isadmin: Boolean

  constructor(private _matchMakingService: MatchmakingService, private _friendRequestService: FriendRequestService) {
    this.isplaying = false
    this.isspectating = false
    this.isadmin = false
    this.recently_played = new Array()
    this.ongoing_matches = new Array()

    }

  ngOnInit(): void {
    this.isready = false
    var matchinfo: any = localStorage.getItem('matchinfo')
    if(matchinfo != null){
      matchinfo = JSON.parse(matchinfo)
      if(matchinfo.isplaying == "true"){
        this.isplaying = true
        this.isready = true
      }
    }
    this.current_user = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))
    for(let i = 0; i < this.current_user.recently_played.length; i++){
      this.recently_played.push(this.current_user.recently_played[i])
    }
    this.isadmin = (this.current_user.role == 'admin')
    this.listenToMatchmaking()
   }

  // If the user quits, matchmaking is canceled; if these emits don't go off (sometimes the beforeunload event is not caught),
  // the server already has some guarding logic that prevents the user to queue up twice. Once the user logs back in, the client
  // invokes (for further safety) this.cancelMatchmaking() . If the user logs off or exits the page and for some reason the
  // beforeunload event isn't caught, then the user will still be in queue and may be matched up with another user, but will end up
  // losing for inactivity.
  @HostListener('window: beforeunload', ['$event'])
  unloadHandler(event: Event) {
    this._matchMakingService.cancelMatchMaking(this.current_user)
    this.isready = false
  }
  ngOnDestroy(){
    this._matchMakingService.cancelMatchMaking(this.current_user)
    this.isready = false
  }

  listenToMatchmaking(){
    this._matchMakingService.listenToMatchmaking(this.current_user).subscribe((observer) => {
      if(observer.message_type == 'yougotmatched'){
        // Updating the "recently played" list (no longer than 10) and closing all menus
        if(!this.recently_played.includes(observer.enemy)){
          this.recently_played.push(observer.enemy)
          if(this.recently_played.length > 10){ this.recently_played.shift() }
        }
        this.isready = false
        this.isplaying = true
        this._matchMakingService.closeMenus(this.current_user.username)

        // Setting up the game environment and create the match in the DB
        localStorage.setItem('matchinfo', JSON.stringify({
          isplaying: JSON.stringify(true),
          enemy: observer.enemy,
          starttime: observer.starttime
        }))
        if(observer.creatematchprio == true){
          var player1
          var player2
          if(this.current_user.username.localeCompare(observer.enemy) < 0){
            player1 = this.current_user.username
            player2 = observer.enemy
          }else{
            player1 = observer.enemy
            player2 = this.current_user.username
          }
          this._matchMakingService.createMatch({
            player1: player1,
            player2: player2,
            winner: '',
            timestamp: observer.starttime
          })
        }
      }
      else if(observer.message_type == 'matchended'){
        // We remove any information about the match we just played and reopen the menus
        localStorage.removeItem('matchinfo')
        this.isplaying = false
        this.isready = false
        this._matchMakingService.openMenus(this.current_user.username)
      }
      else if(observer.message_type == 'newongoingmatches'){
        this.ongoing_matches = new Array()
        for(let i = 0; i < observer.ongoing_matches.length; i++){
          if(observer.ongoing_matches[i].player1 != this.current_user.username && observer.ongoing_matches[i].player2 != this.current_user.username){
            this.ongoing_matches.push(observer.ongoing_matches[i])
          }
        }
      }
      // If a user accepted our invite to play
      else if(observer.message_type == 'matchinviteaccepted'){
        // If we're not playing or waiting to play, we can start the match and notify the other user that he can start loading its match itnerface
        if(!this.isplaying && !this.isready){
          const starttime = new Date()

          localStorage.setItem('matchinfo', JSON.stringify({
            isplaying: JSON.stringify(true),
            enemy: observer.accepting_user,
            starttime: starttime
          }))

          var player1
          var player2
          if(this.current_user.username.localeCompare(observer.accepting_user) < 0){ player1 = this.current_user.username; player2 = observer.accepting_user }
          else{ player1 = observer.accepting_user; player2 = this.current_user.username }

          this._matchMakingService.createMatch({
            player1: player1,
            player2: player2,
            winner: '',
            timestamp: starttime
          })

          this.availableForMatch(this.current_user.username, observer.accepting_user, starttime)

          this.isready = false
          this.isplaying = true
          this._matchMakingService.closeMenus(this.current_user.username)

        }
        // If we're already in a match, we ignore the fact that the user accepted our invite and notify him that we are not available atm
        else{
          this.notAvailableForMatch(this.current_user.username, observer.accepting_user)
        }
      }
      else if(observer.message_type == 'newfriend'){
        this.current_user.friends_list.push(observer.accepting_user)
      }
    })
  }

  startSpectating(player1: String, player2: String){
    this.isspectating = true
    localStorage.setItem('spectateinfo', JSON.stringify({player1: player1, player2: player2}))
  }

  stopSpectating(){
    this.isspectating = false
    localStorage.removeItem('spectateinfo')
  }

  availableForMatch(current_user: String, accepting_user: String, starttime: Date){
    this._matchMakingService.availableForMatch(current_user, accepting_user, starttime)
  }

  notAvailableForMatch(current_user: String, accepting_user: String){
    this._matchMakingService.notAvailableForMatch(current_user, accepting_user)
  }

  sendFriendRequest(username: String){
    var request = new FriendRequest()
    request.sender = this.current_user.username
    request.receiver = username
    this._friendRequestService.sendFriendRequest(request)
  }

  inviteToPlay(username: String){
    this._friendRequestService.inviteToPlay(this.current_user.username, username)
  }


  /*
   A user's skill level for matchmaking is calculated as follows:
   score = (current winstreak * 10) + winrate + accuracy

   A user should not know his current skill level, hence why it will not be shown in its profile stats nor will it be
   permanently stored in the db. A user's skill level is to be calculated everytime that user hits the "ready up" button.
  */
  readyUp(){
   // Calculating the skill score and adding a new temporary field called "skill_level" to the current_user instance
   this.current_user.skill_level = (this.current_user.current_winstreak * 10)
                                 + ((this.current_user.games_won* 100) / (this.current_user.games_played))
                                 + (this.current_user.accuracy)

    var readyuptime = new Date()
    this.current_user.readyuptime = readyuptime.getTime()
    this._matchMakingService.readyUp(this.current_user)
    this.isready = true
  }

  // Cancels matchmaking and pulls the user out of the waiting queue
  cancelMatchMaking(){
    this._matchMakingService.cancelMatchMaking(this.current_user)
    this.isready = false
  }
}
