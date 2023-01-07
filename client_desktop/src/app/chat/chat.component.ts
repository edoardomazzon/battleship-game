import { Component, OnInit } from '@angular/core';
import { ChatmessageService } from '../services/chatmessage.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit {
  public chatopened: Boolean;
  public chatcollapse: Boolean;
  private player1: any;
  private player2: any;
  public messages: any = [];
  public newmessage: String =''
  public chattype: String
  private otheruseronline: Boolean = true

  constructor(private _chatmessageservice: ChatmessageService) {
    this.chatopened = false
    this.chatcollapse = false
    this.chattype = 'match' // Can be 'match' or 'private'
  }

  ngOnInit(): void {
    this._chatmessageservice.receiveMessages().subscribe((message) => {
      // When another component tells us to open a chat between us and another user (let it be a friend or an opponent during a random match)
      if(message.message_type == 'openchat'){
        this.player1 = message.current_user
        this.player2 = message.other_user
        this.chattype = message.chattype
        if(message.chat_type == 'private'){
          this.chattype = 'private'
          this.getMessages()
        }
        this.chatopened = true
      }
      else if(message.message_type == 'youreceivedmessage'){
        this.messages.push(message)
        // Telling the other user that we are in the chat so that he does NOT create a 'newmessage' notification in the DB
        this._chatmessageservice.confirmReception(message.from)
      }
      else if(message.message_type == 'yourmessagereceived'){
        this.otheruseronline = false
      }
    })
  }

  // Queries the last messages between the two users if the chat is opened in private cirsumstance (meaning not during a match)
  public getMessages(){
    this.messages = this._chatmessageservice.getMessagesFromDb(this.player1, this.player2)
  }

  // Sends a message once the user hits "enter" or clicks on the "send" button
  public sendMessage(){
    if(this.newmessage != ''){
      this._chatmessageservice.sendMessage(this.chattype, {from: this.player1, to: this.player2, text_content: this.newmessage, timestamp: new Date()})
      this.messages.push({from: this.player1, to: this.player2, text_content: this.newmessage})

      // The other user has 1.5 seconds to us that he's read the message, otherwise we send a notification to him.
      setTimeout(() => {
        if(!this.otheruseronline){
          this._chatmessageservice.notifyUnreadMessage(this.player1, this.player2)
        }
        else{ this.otheruseronline = true}
      }, 1500)
    }
    this.newmessage = ''
  }

  public openChat(){
    this.chatcollapse = false
  }

  public closeChat(){
    this.chatcollapse = true
  }
}
