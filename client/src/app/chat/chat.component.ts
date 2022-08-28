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
  public chattype: String

  constructor(private _chatmessageservice: ChatmessageService) {
    this.chatopened = false
    this.chattype = 'match' // Can be 'match' or 'private'
  }

  ngOnInit(): void {
    this._chatmessageservice.receiveMessages().subscribe((message) => {
      // When another component tells us to open a chat between us and another user (let it be a friend or an opponent during a random match)
      if(message.message_type == 'openchat'){
        this.player1 = message.current_user
        this.player2 = message.other_user
        if(message.chat_type == 'private'){
          this.chattype = 'private'
          this.getMessages()
        }
        if(message.chat_type == 'match'){
          // Mettere una variabile a false in modo che non compaia il bottone "close chat" perché durante il match
          // La chat non può essere chiusa
        }
        this.chatopened = true
        console.log(this.chattype)
      }
      else if (message.message_type == 'yousentmessage' || message.message_type == 'youreceivedmessage'){
        this.messages.push(message) //Inserisco il messaggio inviato nella lista messages senza dover fare la query
        //this.messages.shift() //Shifto l'array di una posizione per eliminare il messaggio più vecchio
      }
    })
  }

  // Queries the last messages between the two users if the chat is opened in private cirsumstance (meaning not during a match)
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
