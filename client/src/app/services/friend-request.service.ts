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
    this._httpClient.post(this.sendRequestURL, friendrequest).subscribe(() => {
      var user: any = localStorage.getItem('current_user')
      if(user != null){
        user = JSON.parse(user)
        user.friends_list.push(friendrequest.sender)
        localStorage.removeItem('current_user')
        localStorage.setItem('current_user', JSON.stringify(user))
        
        this.socket.emit('newfriendrequest', {
        request_type: 'friendrequest',
        request_sender: friendrequest.sender,
        request_receiver: friendrequest.receiver
      }
    })
    /* Da qui il server dovrà ascoltare la emit e a sua volta fare una emit
       di 'friendrequest'+friendrequest.receiver così chi riceve la richiesta di amicizia è subito avvisato e di conseguenza aggiorna la sua lista
       di pending_friend_requests senza dover rifare la query; in myprofile.component.ts basterà fare this.friend_requests.push(friendrequest.sender)
       e in più aggiornare anche il localstorage con la nuova friendrequest inserita in lista. */
  }

  acceptFriendRequest(accepted_request: FriendRequest){
    return this._httpClient.post(this.acceptRequestURL, accepted_request).subscribe((response) => { //nella response c'è la nostra nuova friendslist
      //Una volta accettata la richiesta aggiorniamo il localstorage del current_user con la nuova friends list e la nuova pending_friend_requests
      var user: any = localStorage.getItem('current_user')
      if(user != null){
        console.log('La response dal server è: ', response)
        user = JSON.parse(user)
        user.friends_list = response //aggiorno la lista di amici del current user
        localStorage.removeItem('current_user')
        localStorage.setItem('current_user', JSON.stringify(user))


        //Avviso il server di una nuova accepted request
        this.socket.emit('newacceptedrequest', {
          request_type: 'accept',
          accepting_user: ''+accepted_request.sender,
          accepted_user: ''+accepted_request.receiver
        })
      }
    })
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
      //If this Socket.io emit is listened, it means a user sent us a friend request
      this.socket.on('friendrequest'+current_username, (message:any) => {
        observer.next(message);
      });
      //If this Socket.io emit is listened, it means we accepted a friend request
      this.socket.on('acceptedrequest'+current_username, (message: any) => {
        observer.next(message);
      });
      //If this Socket.io emit is listened, it means a user accepted our friend request
      this.socket.on('yougotaccepted'+current_username, (message: any) => {
        observer.next(message);
      });
      //If this Socket.io emit is listened, it means we rejected a friend request
      this.socket.on('rejectedrequest'+current_username, (message: any) => {
        console.log('ho sentito la rejectedrequest'+current_username)
        observer.next(message);
      });
      //If this Socket.io emit is listened, it means we blocked a user
      this.socket.on('blockeduser'+current_username, (message: any) => {
        observer.next(message);
      });

      return () => {
        this.socket.disconnect()
      }
    });
  }
}
