import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FriendRequest } from '../models/friend-request';

@Injectable({
  providedIn: 'root'
})

export class FriendRequestService {
  private sendRequestURL = 'http://localhost:3000/friendrequest'
  private acceptRequestURL = 'http://localhost:3000/acceptfriendrequest'
  constructor(private _httpClient: HttpClient) { }

  //Effettua una chiamata HTTP alla route "friendrequest" passando la friendrequest che come sender ha l'username di chi ha chiesto l'amicizia
  // e come receiver ha l'username di chi la riceve
  sendFriendRequest(friendrequest: FriendRequest) {
    return this._httpClient.post(this.sendRequestURL, friendrequest).subscribe()
  }

  acceptFriendRequest(accepted_request: FriendRequest){
    return this._httpClient.post(this.acceptRequestURL, accepted_request).subscribe()
  }
}
