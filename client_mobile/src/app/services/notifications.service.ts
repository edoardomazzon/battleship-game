import { Injectable } from '@angular/core';
import {io, Socket} from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private socket: Socket;
  private baseURL = 'http://192.168.188.23:3000/'

  constructor() {
    this.socket = io(this.baseURL)
  }

  // Whatever the notification is, we forward it to the Notification or Header Component
  listenToNotifications(current_user: String): Observable <any>{
    return new Observable<any>((observer) => {
      this.socket.on('newnotification'+current_user, (notification) => {
        observer.next(notification)
      })
    })
  }

  acceptMatch(matchinfo: any){
    this.socket.emit('acceptmatch', matchinfo)
    //If we accept a match we also cancel the matchmaking
    this.socket.emit('cancelmatchmaking', matchinfo.accepting_user)
  }

}
