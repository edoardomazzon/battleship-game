import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FriendRequest } from '../models/friend-request';
import {io, Socket} from 'socket.io-client';
import { Observable, raceWith } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class FriendRequestService {
  private baseURL = 'http://localhost:3000/'
  private sendRequestURL = 'http://localhost:3000/friendrequest'
  private acceptRequestURL = 'http://localhost:3000/acceptfriendrequest'
  private rejectRequestURL = 'http://localhost:3000/rejectfriendrequest'
  private blacklistRequestURL = 'http://localhost:3000/blacklistuser'
  private removeFriendURL = 'http://localhost:3000/removefriend'
  private socket: Socket;

  constructor(private _httpClient: HttpClient) {
    this.socket = io(this.baseURL)
  }

  //Effettua una chiamata HTTP alla route "friendrequest" passando la friendrequest che come sender ha l'username di chi ha chiesto l'amicizia
  // e come receiver ha l'username di chi la riceve
  sendFriendRequest(friendrequest: FriendRequest) {
    this._httpClient.post(this.sendRequestURL, friendrequest).subscribe(() => {
      this.socket.emit('newfriendrequest', {
        request_type: 'friendrequest',
        sender: friendrequest.sender,
        receiver: friendrequest.receiver
      })
    })
    // Telling the client to make the red notification badge appear if the friends menu is not already expanded
    this.socket.emit('newnotification',
      {user: friendrequest.receiver,
       from: friendrequest.sender,
       notification_type: 'friendrequest'
      })
  }

  acceptFriendRequest(accepted_request: FriendRequest){
    return this._httpClient.post(this.acceptRequestURL, accepted_request).subscribe((response) => { //nella response c'è la nostra nuova friendslist
      //Una volta accettata la richiesta aggiorniamo il localstorage del current_user con la nuova friends list e la nuova pending_friend_requests
      var user: any = localStorage.getItem('current_user')
      if(user != null){
        user = JSON.parse(user)
        user.friends_list = response //aggiorno la lista di amici del current user
        localStorage.removeItem('current_user')
        localStorage.setItem('current_user', JSON.stringify(user))
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

  removeFriend(remove_request: FriendRequest){
    return this._httpClient.post(this.removeFriendURL, remove_request).subscribe((response) => {
      // Once the two users are updated at db level we can update our localstorage with our new friends list in the response
      var user: any = localStorage.getItem('current_user')
      if(user != null || user != undefined){
        user = JSON.parse(user)
        user.friends_list = response
        localStorage.removeItem('current_user')
        localStorage.setItem('current_user', JSON.stringify(user))
      }
      this.socket.emit('newdeletedfriend',{
        request_type: 'delete',
        deleter: ''+remove_request.sender,
        deleted: ''+remove_request.receiver
      })
    })
  }

  unblockUser(current_user: String, blocked_user: String){
    this._httpClient.post(this.baseURL+'unblockuser', {username: current_user, blocked_user: blocked_user}).subscribe()
  }

  inviteToPlay(current_user: String, friend: String){
    var notification = {
      user: friend,
      from: current_user,
      notification_type: 'matchinvite',
      timestamp: new Date()
    }
    this.socket.emit('newnotification', notification )
    this._httpClient.post(this.baseURL+'createnotification', notification).subscribe()
  }


  listenToAnsweredRequests(current_username: String): Observable <any>{
    return new Observable((observer) => {
      //If this Socket.io emit is listened, it means a user sent us a friend request
      this.socket.on('friendrequest'+current_username, (message:any) => {
        var user: any = localStorage.getItem('current_user')
        if(user != null){
          user = JSON.parse(user)
          console.log(message.sender + ' sta chiedendo l\'amicizia a ' + message.receiver)
          // If the request sender is not in our blacklist then we can update the localstorage
          if(!user.blacklisted_users.includes(message.sender) && !user.pending_friend_requests.includes(message.sender)){
            user.pending_friend_requests.push(message.sender)
            localStorage.removeItem('current_user')
            localStorage.setItem('current_user', JSON.stringify(user))
          }
        }
        observer.next(message);
      });
      //If this Socket.io emit is listened, it means we accepted a friend request
      this.socket.on('acceptedrequest'+current_username, (message: any) => {
        observer.next(message);
      });
      //If this Socket.io emit is listened, it means a user accepted our friend request
      this.socket.on('yougotaccepted'+current_username, (message: any) => {
        var user: any = localStorage.getItem('current_user')
        if(user != null){
          user = JSON.parse(user)
          user.friends_list.push(message.accepting_user)
          localStorage.removeItem('current_user')
          localStorage.setItem('current_user', JSON.stringify(user))
        }
        observer.next(message);
      });
      //If this Socket.io emit is listened, it means we rejected a friend request
      this.socket.on('rejectedrequest'+current_username, (message: any) => {
        observer.next(message);
      });
      //If this Socket.io emit is listened, it means we blocked a user
      this.socket.on('blockeduser'+current_username, (message: any) => {
        observer.next(message);
      });
      //If this Socket.io emit is listened, it means we deleted a user from our friends list
      this.socket.on('deletedfriend'+current_username, (message: any) => {
        observer.next(message)
      })
      //If this Socket.io emit is listened, it means a user deleted us from his friends list
      this.socket.on('yougotdeleted'+current_username, (message: any) => {
        observer.next(message)
      })

      return () => {
        this.socket.disconnect()
      }
    });
  }
}
