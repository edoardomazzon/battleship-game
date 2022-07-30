import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { ChatMessage } from '../models/chatmessage';
import { HttpClient } from '@angular/common/http';
import io from 'socket.io-client';
import { response } from 'express';



@Injectable({
  providedIn: 'root'
})
export class ChatmessageService {

  private baseURL = 'http://localhost:3000/chatmessage'
  private socket: any;
  constructor(private _httpClient: HttpClient) { }

  receiveMessage(channel_name: String): Observable<any>{
    this.socket = io(this.baseURL)
    return new Observable((observer) => {

      this.socket.on(channel_name, (message: any) => {
        console.log('Socket.io ha ricevuto dal canale ', channel_name, ' questo messaggio: ', JSON.stringify(message));
        observer.next(message);
      });

      this.socket.on('error', (err: any) => {
        console.log('Socket.io error: ', err);
        observer.error(err);
      });

      var a = this.socket
      return {
        unsubscribe(){
          a.disconnect()
        }
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
    console.log('COSA PASSIAMO AL SERVER: ', json)

    this._httpClient.put(this.baseURL, json).subscribe((response) => {
      console.log('LA RESPONSE DAL SERVER QUANDO FACCIAMO GETMESSAGESFROMDB: ', response)
      var returned_list = JSON.parse(JSON.stringify((response)))
      console.log('RETURNED LIST: ', returned_list)
      for(let i = 0; i < returned_list.length; i++){
        console.log('SINGOLO ELEMENTO DELLA RETURNED LIST: ', returned_list[i])
        messages_list.push(returned_list[i])
      }
    })
    return messages_list
  }
}
