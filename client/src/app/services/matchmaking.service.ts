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

  constructor() {
    this.socket = io(this.baseURL)
  }

  readyUp(current_user: any) {
    this.socket.emit('readytoplay', current_user)
  }

  cancelMatchMaking(current_user: any) {
    this.socket.emit('cancelmatchmaking', current_user)
  }

  listenToMatchmaking(current_user: any): Observable <any>{
    return new Observable((observer) => {

    })
  }
}
