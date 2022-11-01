import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html'
})
export class MyProfileComponent implements OnInit {
  public current_user: any;
  public winrate: number;
  public loserate: number;

  constructor(private _profileService: ProfileService) {
    this.winrate = 0
    this.loserate = 0
   }

  ngOnInit(): void {
    var u = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))
    if(u != null){
      //With this function we query the db for the current user's data and save it in the browser's localstorage
      // this._profileService.getUserInfo(u.username)
      this._profileService.getUserInfo()
    }
    u = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))
    this.current_user = u

    this.winrate = Math.floor( 100 * this.current_user.games_won / this.current_user.games_played)
    this.loserate = 100-this.winrate
  }
}
