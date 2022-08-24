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

  spectate(){
    return new Observable((observer) => {
      this.socket.on('userplacedship', (message) => {
        observer.next(message)
      })
      this.socket.on('updateplayerfield', (message) => {
        observer.next(message)
      })
    })
  }
}
