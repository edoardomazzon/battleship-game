import { Injectable } from '@angular/core';
import {io, Socket} from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private socket: Socket;

  constructor() {
    this.socket = io("http://"+ environment.ip_address +":3000")
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
