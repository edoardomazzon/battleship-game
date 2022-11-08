import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpectatorchatService {
  private socket: Socket;

  constructor() {
    this.socket = io(`http://${environment.ip_address}:3000`)
  }

  receiveMessages(player1: String, player2: String){
    return new Observable<any>((observer) => {
      // If one of the two players sends a message during a match
      this.socket.on('newplayermessage'+player1, (message) => {
        observer.next(message)
      })
      this.socket.on('newplayermessage'+player2, (message) => {
        observer.next(message)
      })

      // If another spectator sends a message to the other spectators
      this.socket.on('newspectatormessage'+player1+player2, (message) => {
        observer.next(message)
      })
      this.socket.on('newspectatormessage'+player2+player1, (message) => {
        observer.next(message)
      })
    })
  }

  sendMessage(message: any){
    this.socket.emit('newspectatormessage', message)
  }
}
