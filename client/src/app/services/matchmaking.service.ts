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
  }

  listenToMatchmaking(current_user: any): Observable <any>{
    return new Observable((observer) => {
      this.socket.on('matchstarted'+current_user.username, (matchinfo) => {
        observer.next(matchinfo)
      })
    })
  }
}
