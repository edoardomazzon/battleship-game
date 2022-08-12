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
  private current_user: any


  constructor(private _router: Router, private _httpClient: HttpClient, private _matchMakingService: MatchmakingService) { }

  ngOnInit(): void {
    this.current_user = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))
    this._matchMakingService.listenToMatchmaking(this.current_user).subscribe((observer) => {

    })
   }

  /*
   A user's skill level for matchmaking is calculated as follows:
   score = (current winstreak * 10) + winrate + accuracy
    - Skill level 1: score from   0   to   60
    - Skill level 2: score from   61  to   120
    - Skill level 3: score from   121 to   180
    - Skill level 4: score from   181 to   240
    - Skill level 5: score from   241 to   infinity

   A user should not know his current skill level, hence why it will not be shown in its profile stats nor will it be
   permanently stored in the db. A user's skill level is to be calculated everytime that user hits the "ready up" button.
  */

  readyUp(){
    // Calculating the skill score and adding a new temporary field called "skill_level" to the current_user instance
    var skill_score = (this.current_user.current_winstreak * 10)
                      + ((this.current_user.games_won* 100) / (this.current_user.games_played))
                      + (this.current_user.accuracy)

    if(0 <= skill_score && skill_score <= 60){
      this.current_user.skill_level = 1
    }
    if(61 <= skill_score && skill_score <= 120){
      this.current_user.skill_level = 2
    }
    if(121 <= skill_score && skill_score <= 180){
      this.current_user.skill_level = 3
    }
    if(181 <= skill_score && skill_score <= 240){
      this.current_user.skill_level = 4
    }
    if(241 <= skill_score){
      this.current_user.skill_level = 5
    }
    this.current_user.readyuptime = new Date()
    this.current_user.readyuptime = this.current_user.readyuptime.getTime()
    this._matchMakingService.readyUp(this.current_user)
    this.isready = true
  }

  cancelMatchMaking(){
    this._matchMakingService.cancelMatchMaking(this.current_user)
    this.isready = false
  }

}
