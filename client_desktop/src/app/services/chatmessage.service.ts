import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatMessage } from '../models/chatmessage';
import { HttpClient } from '@angular/common/http';
import {io, Socket} from 'socket.io-client';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})

export class ChatmessageService {
  public baseURL = "http://"+ environment.ip_address +":3000/"
  public socket: Socket
  private current_user = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))

  constructor(private _httpClient: HttpClient) {
    this.socket = io(this.baseURL)
  }

  receiveMessages(): Observable<any>{
    return new Observable((observer) => {

      this.socket.on('openchat', (message) => {
        observer.next(message)
      })

      this.socket.on('youreceivedmessage'+this.current_user.username, (message) => {
        message = {
          from: message.from,
          to: message.to,
          text_content: message.text_content,
          message_type: 'youreceivedmessage'
        }
        observer.next(message);
      });

      this.socket.on('yourmessagereceived'+this.current_user.username, (message) => {
        observer.next(message)
      })

      return () => {
        this.socket.disconnect()
      }
    });
  }

  getMessagesFromDb(player1: String, player2: String): ChatMessage[]{
    //Riutilizziamo il model di angular "ChatMessage" perché ha i campi from e to che dobbiamno inviare al db incapsulati in un unico oggetto
    var from_to = new ChatMessage()
    from_to.from = player1
    from_to.to = player2
    var messages_list: any[] = []

    var json = JSON.parse(JSON.stringify(from_to))

    this._httpClient.put(this.baseURL+'chatmessage', json).subscribe((response) => {
      var returned_list = JSON.parse(JSON.stringify((response))) //La repsonse ha l'array (già invertito dal lato server) degli ultimi 10 messaggi
      for(let i = 0; i < returned_list.length; i++){
        messages_list.push(returned_list[i])//Riempiamo la message list che ritorniamo a chat component
      }
    })
    return messages_list
  }

  sendMessage(chattype: String, newmessage: any){
    if(chattype == 'private'){
      this._httpClient.post(this.baseURL+'chatmessage', newmessage).subscribe()
    }
    this.socket.emit('newmessage', newmessage)

    if(chattype == 'match'){
      this.socket.emit('newplayermessage', newmessage)
    }
  }

  startChat(players: any){
    this.socket.emit('startchat', players)
  }

  confirmReception(sender: String){
    this.socket.emit('confirmreception', {sender: sender, message_type: 'yourmessagereceived'})
  }

  notifyUnreadMessage(current_user: String, user: String){
    var notification = {
      user: user,
      from: current_user,
      notification_type: 'newmessage',
      timestamp: new Date()
    }
    this.socket.emit('newnotification', notification)
    this._httpClient.post(this.baseURL+'createnotification', notification).subscribe()
  }
}
