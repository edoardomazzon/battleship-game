import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SpectatorchatService {

  private socket: Socket;
  private baseURL = 'http://10.0.2.2:3000/'

  constructor() {
    this.socket = io(this.baseURL)
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
