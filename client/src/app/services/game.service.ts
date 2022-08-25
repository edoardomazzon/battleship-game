import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {io, Socket} from 'socket.io-client';
import { EmptyError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private socket: Socket;
  private baseURL = 'http://localhost:3000/'

  constructor(private _httpClient: HttpClient) {
    this.socket = io(this.baseURL)
  }

  confirmShipPlacement(current_user: String, enemy: String){
    this.socket.emit('confirmshippositioning', {
      current_user: current_user,
      enemy: enemy,
      firstturn: ''
    })
  }

  startGame(current_user: String, enemy: String){
    return new Observable((observer) => {
      this.socket.on('yourenemyconfirmed'+current_user, (shot) => {
        observer.next(shot)
      })

      this.socket.on('yougotshot'+current_user, (shot) => {
        observer.next(shot)
      })

      this.socket.on('shotresult'+current_user, (shot) => {
        observer.next(shot)
      })

      this.socket.on('enemyleft'+current_user, (leavenotification) => {
        observer.next(leavenotification)
      })

      this.socket.on('enemywantsrematch'+current_user, (request) => {
        observer.next(request)
      })

      this.socket.on('enemyacceptedrematch'+current_user, (request) => {
        observer.next(request)
      })

      this.socket.on('youtimedout'+current_user, (message) => {
        observer.next(message)
      })

      this.socket.on('disconnected', () => {
        console.log('disconnected from game')
        this.socket.emit('matchleft', {winner: enemy, message_type: 'enemyleftwhileplaying'})
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

  notifyShotToSpectators(message: any){
    this.socket.emit('newenemyfieldshot', message)
  }

  notifyPositioningToSpectators(message: any){
    this.socket.emit('newfieldpositioning', message)
  }

  updateAccuracy(username: String, hit: Boolean){
    this._httpClient.post(this.baseURL+'updateaccuracy', {username: username, hit: hit}).subscribe()
  }

  leaveMatch(leavenotification: any){
    this.socket.emit('matchleft', leavenotification)
  }

  winGameDB(current_user: String, enemy: String, timestamp: any){
    this._httpClient.post(this.baseURL+'wingame', {
      username: current_user,
      enemy: enemy,
      timestamp: timestamp
    }).subscribe()
    this.socket.emit('matchended', {player1: current_user, player2: enemy})
  }

  notifyEnemyTimeout(enemy: String){
    this.socket.emit('enemytimedout', {
      message_type: 'youtimedout',
      enemy: enemy
    })
  }

  loseGameDB(current_user: String){
    this._httpClient.post(this.baseURL+'losegame', {username: current_user}).subscribe()
  }

  askForRematch(request: any){
    this.socket.emit('rematchrequest', request)
  }

  acceptRematch(request: any){
    this.socket.emit('acceptrematch', request)
  }

}
