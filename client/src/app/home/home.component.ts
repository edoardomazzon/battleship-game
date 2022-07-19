import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs';
import { ProfileService } from '../services/profile.service';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { FriendRequestService } from '../services/friend-request.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  public newfriend: User = new User()
  constructor(private _httpClient: HttpClient,
              private _profileService: ProfileService,
              private _router: Router,
              private _friendRequestService: FriendRequestService) { }

  ngOnInit(): void {}

  gotoprofile(): void {
    this._profileService.profile()
  }

  logoutUser(): void{
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
  }

  newFriendRequest(): void{
    console.log('DA HOME COMPONENT TS: PROVO AD AGGIUNGERE L\'UTENTE: ', this.newfriend.username, '\n')
    this._friendRequestService.sendFriendRequest(this.newfriend)
  }
}
