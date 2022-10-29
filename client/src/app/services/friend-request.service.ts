import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FriendRequest } from '../models/friend-request';
import {io, Socket} from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class FriendRequestService {
  private baseURL = 'http://192.168.188.23:3000/'
  private socket: Socket;

  constructor(private _httpClient: HttpClient) {
    this.socket = io(this.baseURL)
  }

  listenToRequests(current_username: String): Observable <any>{
    return new Observable((observer) => {
      //If this Socket.io emit is listened, it means a user sent us a friend request
      this.socket.on('friendrequest'+current_username, (message:any) => {
        observer.next(message);
      });

      //If this Socket.io emit is listened, it means a user accepted our friend request
      this.socket.on('yougotaccepted'+current_username, (message: any) => {
        observer.next(message);
      });

      //If this Socket.io emit is listened, it means a user deleted us from his friends list
      this.socket.on('yougotdeleted'+current_username, (message: any) => {
        observer.next(message)
      })

      return () => {
        this.socket.disconnect()
      }
    });
  }

  sendFriendRequest(friendrequest: FriendRequest) {
    this._httpClient.post(this.baseURL+"friendrequest", friendrequest).subscribe((response) => {
      if(response == 'ok'){
        this.socket.emit('newfriendrequest', {
          request_type: 'friendrequest',
          sender: friendrequest.sender,
          receiver: friendrequest.receiver
        })
        // Telling the client to make the red notification badge appear if the friends menu is not already expanded
        this.socket.emit('newnotification',
          {user: friendrequest.receiver,
           from: friendrequest.sender,
           notification_type: 'friendrequest'
          })
      }
    })
  }

  acceptFriendRequest(accepted_request: FriendRequest){
    this._httpClient.post(this.baseURL+"acceptfriendrequest", accepted_request).subscribe()
    this.socket.emit('newacceptedrequest', {
      accepting_user: accepted_request.sender,
      accepted_user: accepted_request.receiver
    })
  }

  rejectFriendRequest(rejected_request: FriendRequest){
    this._httpClient.post(this.baseURL+"rejectfriendrequest", rejected_request).subscribe()
  }

  blacklistUser(blacklist_request: FriendRequest){
    this._httpClient.post(this.baseURL+"blacklistuser", blacklist_request).subscribe()
  }

  removeFriend(remove_request: FriendRequest){
    this._httpClient.post(this.baseURL+"removefriend", remove_request).subscribe()
    this.socket.emit('deletefriend',{
      request_type: 'delete',
      deleter: ''+remove_request.sender,
      deleted: ''+remove_request.receiver
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
    this._httpClient.post(this.baseURL+'createnotification', notification).subscribe()
    this.socket.emit('newnotification', notification )
  }
}
