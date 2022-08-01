import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FriendRequest } from '../models/friend-request';
import {io, Socket} from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class FriendRequestService {
  private baseURL = 'http://localhost:3000/'
  private sendRequestURL = 'http://localhost:3000/friendrequest'
  private acceptRequestURL = 'http://localhost:3000/acceptfriendrequest'
  private rejectRequestURL = 'http://localhost:3000/rejectfriendrequest'
  private blacklistRequestURL = 'http://localhost:3000/blacklistuser'
  private socket: Socket;
  constructor(private _httpClient: HttpClient) {
    this.socket = io(this.baseURL)
   }

  //Effettua una chiamata HTTP alla route "friendrequest" passando la friendrequest che come sender ha l'username di chi ha chiesto l'amicizia
  // e come receiver ha l'username di chi la riceve
  sendFriendRequest(friendrequest: FriendRequest) {
    this._httpClient.post(this.sendRequestURL, friendrequest).subscribe()
    // this.socket.emit('newfriendrequest'+friendrequest.receiver, friendrequest)
  }

  acceptFriendRequest(accepted_request: FriendRequest){
    return this._httpClient.post(this.acceptRequestURL, accepted_request).subscribe()
  }

  rejectFriendRequest(rejected_request: FriendRequest){
    return this._httpClient.post(this.rejectRequestURL, rejected_request).subscribe(response =>{
      //Una volta rifiutata la richiesta con successo possiamo aggiornare nel localStorage la pending_friend_requests di current_user
      var user: any = localStorage.getItem('current_user')
      if(user != null){
        user = JSON.parse(user)
        user.pending_friend_requests = response
        localStorage.removeItem('current_user')
        localStorage.setItem('current_user', JSON.stringify(user))
        this.socket.emit('newrejectedrequest', {
          request_type: 'reject',
          rejecting_user: ''+rejected_request.sender,
          rejected_user: ''+rejected_request.receiver
        })
      }
    })
  }

  blacklistUser(blacklist_request: FriendRequest){
    return this._httpClient.post(this.blacklistRequestURL, blacklist_request).subscribe(response => {
      //Una volta bannato l'utente possiamo aggiornare nel localStorage la blacklisted_users di current_user
      var user: any = localStorage.getItem('current_user')
      if(user != null){
        user = JSON.parse(user)
        user.blacklisted_users = response
        localStorage.removeItem('current_user')
        localStorage.setItem('current_user', JSON.stringify(user))
      }
      this.socket.emit('newblockeduser',{
        request_type: 'block',
        blocker: ''+blacklist_request.sender
      })
    })
  }

  listenToAnsweredRequests(current_username: String): Observable <any>{
    return new Observable((observer) => {

      this.socket.on('acceptedrequest', (message: any) => {
        observer.next(message);
      });

      this.socket.on('rejectedrequest'+current_username, (message: any) => {
        console.log('ho sentito la rejectedrequest'+current_username)
        observer.next(message);
      });

      this.socket.on('blockeduser'+current_username, (message: any) => {
        observer.next(message);
      });

      return () => {
        this.socket.disconnect()
      }
    });
  }
}
