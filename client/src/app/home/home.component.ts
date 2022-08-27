import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatchmakingService } from '../services/matchmaking.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  private baseURL = 'http://localhost:3000/'
  private readyUpURL = 'http://localhost:3000/readyup'
  public isready = false
  public isplaying: Boolean
  public isspectating: Boolean
  private current_user: any
  public ongoing_matches: any

  constructor(private _router: Router, private _httpClient: HttpClient, private _matchMakingService: MatchmakingService) {
    this.isplaying = false
    this.isspectating = false
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
    this.listenToMatchmaking()
   }

  // If the user quits, matchmaking is canceled; if these emits don't go off (sometimes the beforeunload event is not caught),
  // the server already has some guarding logic that prevents the user to queue up twice. Once the user logs back in, the client
  // invokes (for further safety) this.cancelMatchmaking() . If the user logs off or exits the page and for some reason the
  // beforeunload event isn't caught, then the user will ste be in queue and may be matched up with another user, but will end up
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
        this.isready = false
        this.isplaying = true
        console.log(observer.starttime)
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
        localStorage.removeItem('matchinfo')
        this.isplaying = false
      }
      else if(observer.message_type == 'newongoingmatches'){
        this.ongoing_matches = new Array()
        for(let i = 0; i < observer.ongoing_matches.length; i++){

        }
        this.ongoing_matches = observer.ongoing_matches
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
