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

    this.socket.emit('imspectatingyou', {player1: player1, player2: player2, message_type: 'imspectatingyou'})

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
      this.socket.on('matchended'+player1+player2, (matchinfo) => {
        matchinfo.message_type = 'matchended'
        observer.next(matchinfo)
      })
      this.socket.on('matchended'+player2+player1, (matchinfo) => {
        matchinfo.message_type = 'matchended'
        observer.next(matchinfo)
      })
      this.socket.on('playersrematch'+player1, (message) => {
        message.message_type = 'playersrematch'
        observer.next(message)
      })
      this.socket.on('playersrematch'+player2, (message) => {
        message.message_type = 'playersrematch'
        observer.next(message)
      })
    })
  }

}
