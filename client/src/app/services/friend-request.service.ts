import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FriendRequest } from '../models/friend-request';

@Injectable({
  providedIn: 'root'
})

export class FriendRequestService {
  private sendRequestURL = 'http://localhost:3000/friendrequest'
  private acceptRequestURL = 'http://localhost:3000/acceptfriendrequest'
  private rejectRequestURL = 'http://localhost:3000/rejectfriendrequest'
  private blacklistRequestURL = 'http://localhost:3000/blacklistuser'

  constructor(private _httpClient: HttpClient) { }

  //Effettua una chiamata HTTP alla route "friendrequest" passando la friendrequest che come sender ha l'username di chi ha chiesto l'amicizia
  // e come receiver ha l'username di chi la riceve
  sendFriendRequest(friendrequest: FriendRequest) {
    return this._httpClient.post(this.sendRequestURL, friendrequest).subscribe()
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
      }
      location.reload() //ricarichiamo la pagina per mostrare la pending request scomparsa (FACCIAMO COSI' FINCHE' NON USIAMO SOCKET)
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
      location.reload() //ricarichiamo la pagina per mostrare la blacklist aggiornata (FACCIAMO COSI' FINCHE' NON USIAMO SOCKET)
    })
  }

}
