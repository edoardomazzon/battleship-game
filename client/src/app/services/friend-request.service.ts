import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})

export class FriendRequestService {
  private baseURL = 'http://localhost:3000/friendrequest'
  constructor(private _httpClient: HttpClient,
              private _router: Router) { }

  sendFriendRequest(newfriend: User) {
    console.log('DA FRIENDREQUEST SERVICE: PROVO AD AGGIUNGERE: ', newfriend.username)
    return this._httpClient.post('http://localhost:3000/friendrequest', newfriend).subscribe()
  }
}
