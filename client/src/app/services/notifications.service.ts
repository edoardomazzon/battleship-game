import { Injectable } from '@angular/core';
import {io, Socket} from 'socket.io-client';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private socket: Socket;
  private baseURL = 'http://localhost:3000/'

  constructor() {
    this.socket = io(this.baseURL)
  }

  listenToNotifications(current_user: String): Observable <any>{
    return new Observable<any>((observer) => {
      this.socket.on('newnotification'+current_user, (notification) => {
        observer.next(notification)
      })

      this.socket.on('friendnotavailable'+current_user, (notification) =>{
        observer.next(notification)
      })
    })
  }

  acceptMatch(matchinfo: any){
    this.socket.emit('acceptmatch', matchinfo)
    this.socket.emit('cancelmatchmaking', matchinfo.accepting_user) //If we accept a match we also cancel the matchmaking
  }

}
