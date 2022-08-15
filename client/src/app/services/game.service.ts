import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {io, Socket} from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private socket: Socket;
  private baseURL = 'http://localhost:3000/'

  constructor(private _httpClient: HttpClient) {
    this.socket = io(this.baseURL)
  }

  waitForConfirmation(current_user: String){
    return new Observable((observer) => {
      this.socket.on('yourenemyconfirmed'+current_user, (shot) => {
        observer.next(shot)
      })
    })
  }

  confirmShipPlacement(current_user: String, enemy: String){
    this.socket.emit('confirmshippositioning', {
      current_user: current_user,
      enemy: enemy
    })
  }

  startGame(current_user: String, enemy: String){
    return new Observable((observer) => {
      this.socket.on('yougotshot'+current_user, (shot) => {
        observer.next(shot)
      })

      this.socket.on('shotresult'+current_user, (shot) => {
        observer.next(shot)
      })
    })
  }

  fire(firing_user: String, fired_user: String, x: any, y: any){
    this.socket.emit('shotfired', {
      firing_user: firing_user,
      fired_user: fired_user,
      x: x,
      y: y
    })
  }

  sendShotResult(shotresult: any){
    this.socket.emit('shotresult', shotresult)
  }

  updateAccuracy(username: String, hit: Boolean){
    this._httpClient.post(this.baseURL+'updateaccuracy', {username: username, hit: hit}).subscribe()
  }
}
