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


  constructor(private _httpClient: HttpClient) {
    this.socket = io(this.baseURL)
  }

  receiveMessages(): Observable<any>{
    return new Observable((observer) => {

      this.socket.on('connect', ()=>{
        console.log('Mi sto connettendo')
      })

      this.socket.on('message', (message: any) => {
        console.log('Socket.io ha ricevuto questo messaggio: ', JSON.stringify(message));
        observer.next(message);
      });

      return () => {
        this.socket.disconnect()
      }
    });
  }

  getMessagesFromDb(player1: String, player2: String): ChatMessage[]{
    //Riutilizziamo il model di angular "ChatMessage" perché ha i cami from e to che dobbiamno inviare al db incapsulati in un unico oggetto
    var from_to = new ChatMessage()
    from_to.from = player1
    from_to.to = player2
    var messages_list: any[] = []

    var json = JSON.parse(JSON.stringify(from_to))

    this._httpClient.put(this.baseURL+'chatmessage', json).subscribe((response) => {
      var returned_list = JSON.parse(JSON.stringify((response)))
      for(let i = 0; i < returned_list.length; i++){
        messages_list.push(returned_list[i])
      }
    })
    return messages_list
  }


  sendMessage(newmessage: any){
    this._httpClient.post(this.baseURL+'chatmessage', newmessage).subscribe()
    console.log('faccio la emit di newmessage')
    this.socket.emit('new message', newmessage.text_content)
  }

}
