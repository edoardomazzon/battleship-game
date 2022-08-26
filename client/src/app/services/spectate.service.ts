import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SpectateService {

  private socket: Socket;
  private baseURL = 'http://localhost:3000/'

  constructor(private _httpClient: HttpClient) {
    this.socket = io(this.baseURL)
  }

  spectate(player1: String, player2: String){
    console.log('Spectating player1: ', player1, ' and player2: ', player2)
    return new Observable<any>((observer) => {
      this.socket.on('newenemyfieldshot'+player1+player2, (newfield) => {
        observer.next(newfield)
      })
      this.socket.on('newenemyfieldshot'+player2+player1, (newfield) => {
        observer.next(newfield)
      })
      this.socket.on('newfieldpositioning'+player1, (newfield) => {
        observer.next(newfield)
      })
      this.socket.on('newfieldpositioning'+player2, (newfield) => {
        observer.next(newfield)
      })
      this.socket.on('newplayermessage'+player1, (message) => {
        observer.next(message)
      })
      this.socket.on('newplayermessage'+player2, (message) => {
        observer.next(message)
      })
    })
  }
}
