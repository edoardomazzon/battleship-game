import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import { FriendRequestService } from '../services/friend-request.service';
import { FriendRequest } from '../models/friend-request';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  public friendrequest: FriendRequest = new FriendRequest()
  constructor(private _profileService: ProfileService,
              private _friendRequestService: FriendRequestService) { }

  ngOnInit(): void {}

  gotoprofile(): void {
    this._profileService.profile()
  }

  logoutUser(): void{
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
  }

  //Funzione chiamata quando un utente A preme su "Send friend request" di fianco a un utente B
  newFriendRequest(): void{
    this.friendrequest.sender = JSON.parse(JSON.parse(JSON.stringify((localStorage.getItem('current_user'))))).username
    console.log(this.friendrequest)
    this._friendRequestService.sendFriendRequest(this.friendrequest) //Funzione in FriendRequestService
  }
}
