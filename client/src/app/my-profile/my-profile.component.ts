import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import { FriendRequestService } from '../services/friend-request.service';
import { FriendRequest } from '../models/friend-request';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
  public current_user: any;

  constructor(private _profileService: ProfileService) { }

  ngOnInit(): void {
    var u = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))
    if(u != null){
      //With this function we query the db for the current user's data and save it in the browser's localstorage
      this._profileService.getUserInfo(u.username)
    }
    u = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))
    this.current_user = u
  }
}
