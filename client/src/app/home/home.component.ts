import { Component, OnInit } from '@angular/core';
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
  public isplaying
  private current_user: any

  constructor(private _router: Router, private _httpClient: HttpClient, private _matchMakingService: MatchmakingService) {
    this.isplaying = false
  }

  ngOnInit(): void {
    var matchinfo: any = localStorage.getItem('matchinfo')
    if(matchinfo != null){
      matchinfo = JSON.parse(matchinfo)
      console.log(matchinfo)
      if(matchinfo.isplaying == "true"){
        this.isplaying = true
        this.isready = true
      }
    }
    this.current_user = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))
    this._matchMakingService.listenToMatchmaking(this.current_user).subscribe((observer) => {
      console.log(observer)
      if(observer.message_type == 'yougotmatched'){
        this.isready = false
        this.isplaying = true
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
    })
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

  cancelMatchMaking(){
    this._matchMakingService.cancelMatchMaking(this.current_user)
    this.isready = false
  }
}
