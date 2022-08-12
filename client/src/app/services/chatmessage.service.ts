import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatMessage } from '../models/chatmessage';
import { HttpClient } from '@angular/common/http';
import {io, Socket} from 'socket.io-client';


@Injectable({
  providedIn: 'root'
})
export class ChatmessageService {

  public baseURL = 'http://localhost:3000/'
  public socket: Socket
  private current_user = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))

  constructor(private _httpClient: HttpClient) {
    this.socket = io(this.baseURL)
  }

  receiveMessages(): Observable<any>{
    return new Observable((observer) => {

      this.socket.on('yousentmessage'+this.current_user.username, (message: any) => {
        message = {
          from: message.from,
          to: message.to,
          text_content: message.text_content,
          message_type: 'yousentmessage'
        }
        observer.next(message);
      });

      this.socket.on('youreceivedmessage'+this.current_user.username, (message: any) => {
        message = {
          from: message.from,
          to: message.to,
          text_content: message.text_content,
          message_type: 'youreceivedmessage'
        }
        observer.next(message);
      });

      this.socket.on('openchat', (message: any) => {
        message = {
          current_user: message.current_user,
          other_user: message.other_user,
          message_type: 'openchat'
        }
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
      if(returned_list.length > 0){
        for(let i = 0; i < returned_list.length; i++){
          messages_list.push(returned_list[i])//Riempiamo la message list che ritorniamo a chat component
        }
      }
      else{
        var blankmessage = new ChatMessage()
        blankmessage.from = ''
        blankmessage.to = ''
        blankmessage.text_content = ''
        for(let i = 0; i < 10; i++){
          messages_list.push(blankmessage)//Riempiamo la message list che ritorniamo a chat component
        }
      }

    })
    return messages_list
  }

  sendMessage(newmessage: any){
    this._httpClient.post(this.baseURL+'chatmessage', newmessage).subscribe()
    this.socket.emit('newmessage', newmessage)
  }


  startChat(players: any){
    this.socket.emit('chatstarted', players)
  }
}
