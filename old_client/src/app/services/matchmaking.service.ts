import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {io, Socket} from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatchmakingService {
  private socket: Socket;
  private baseURL = 'http://localhost:3000/'

  constructor(private _httpClient: HttpClient) {
    this.socket = io(this.baseURL)
  }

  readyUp(current_user: any) {
    this.socket.emit('readytoplay', current_user)
  }

  cancelMatchMaking(current_user: any) {
    this.socket.emit('cancelmatchmaking', current_user)
  }

  createMatch(match_info: any){
    this._httpClient.post(this.baseURL+'creatematch', match_info).subscribe()
    this.socket.emit('matchcreated', match_info)
  }

  availableForMatch(current_user: String, accepting_user: String, starttime: Date){
    this.socket.emit('availableformatch', {
      user: accepting_user,
      from: current_user,
      starttime: starttime})
  }

  notAvailableForMatch(current_user: String, accepting_user: String){
    this.socket.emit('newnotification', {
      user: accepting_user,
      from: current_user,
      notification_type: 'friendnotavailable'
    })
  }

  closeMenus(current_user: String){
    this.socket.emit('closeheadermenus', {
      user: current_user,
      notification_type: 'closeheadermenus'
    })
  }

  openMenus(current_user: String){
    this.socket.emit('openheadermenus', {
      user: current_user,
      notification_type: 'openheadermenus'
    })
  }


  listenToMatchmaking(current_user: any): Observable <any>{
    return new Observable((observer) => {
      this.socket.on('matchstarted'+current_user.username, (matchinfo) => {
        observer.next(matchinfo)
      })

      this.socket.on('matchended'+current_user.username, (message) => {
        observer.next(message)
      })

      this.socket.on('newongoingmatches', (message) => {
        observer.next(message)
      })

      this.socket.on('matchinviteaccepted'+current_user.username, (message) => {
        observer.next(message)
      })

      this.socket.on('yougotaccepted'+current_user.username, (message) => {
        message.message_type = 'newfriend'
        observer.next(message)
      })
    })
  }
}
