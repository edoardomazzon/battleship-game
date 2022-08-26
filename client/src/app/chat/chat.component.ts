import { Component, OnInit } from '@angular/core';
import { ChatmessageService } from '../services/chatmessage.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  public chatopened: Boolean
  private player1: any;
  private player2: any;
  public messages: any = [];
  public newmessage: String =''
  chattype: String

  constructor(private _chatmessageservice: ChatmessageService) {
    this.chatopened = false
    this.chattype = 'match' // Can be 'match' or 'private'
  }

  ngOnInit(): void {
    this.getMessages()
    this._chatmessageservice.receiveMessages().subscribe((message) => {
      if(message.message_type == 'openchat'){
        this.player1 = message.current_user
        this.player2 = message.other_user
        this.getMessages()
        this.chatopened = true
      }
      else if (message.message_type == 'yousentmessage' || message.message_type == 'youreceivedmessage'){
        this.messages.push(message) //Inserisco il messaggio inviato nella lista messages senza dover fare la query
        //this.messages.shift() //Shifto l'array di una posizione per eliminare il messaggio più vecchio
      }
    })
  }

  public getMessages(){
    this.messages = this._chatmessageservice.getMessagesFromDb(this.player1, this.player2)
  }

  //Invia un messaggio quando l'utente preme sul bottone "invia"
  public sendMessage(){
    if(this.newmessage != ''){
      this._chatmessageservice.sendMessage(this.chattype,{from: this.player1, to: this.player2, text_content: this.newmessage})
    }
    this.newmessage = ''
  }

  public closeChat(){
    this.chatopened = false
  }
}
