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

  readyUp(){
    this._matchMakingService.readyUp(this.current_user)
    this.isready = true
  }

  cancelMatchMaking(){
    this._matchMakingService.cancelMatchMaking(this.current_user)
    this.isready = false
  }

}
