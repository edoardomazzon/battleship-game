import { Component, OnInit } from '@angular/core';
import { SpectatorchatService } from '../services/spectatorchat.service';

@Component({
  selector: 'app-spectatorchat',
  templateUrl: './spectatorchat.component.html',
})
export class SpectatorchatComponent implements OnInit {
  public chatopened: Boolean;
  public chatcollapse: Boolean;
  public messages: Array<any> = new Array()
  public newmessage: String
  public player1: String
  public player2: String
  public current_user: String

  constructor(private _spectatorchatService: SpectatorchatService) {
    this.chatopened = true
    this.chatcollapse = true
    var current_user = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))
    var spectateinfo = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('spectateinfo'))))
    this.player1 = spectateinfo.player1
    this.player2 = spectateinfo.player2
    this.current_user = current_user.username
    this.newmessage = ''
  }

  ngOnInit(): void {
    this.receiveMessages()
  }

  // The spectators starts receiving messages from other spectators (of that same match) and the two players themselves.
  receiveMessages(){
    this._spectatorchatService.receiveMessages(this.player1, this.player2).subscribe((message) => {
      // Whatever message we receive, we push it into our messages list so we can show it in the chat.
      this.messages.push({from: message.from, text_content: message.text_content})
    })
  }

  // In order for a spectator to send a message, he needs to also specify the two users he's spectating; that's why
  // the "player1" and "player2" fields are included in the message emitted to the server, so that the latter can
  // re-emit the message to the correct spectators.
  sendMessage(){
    if(this.newmessage != ''){
      var message = {
        from: this.current_user,
        player1: this.player1,
        player2: this.player2,
        text_content: this.newmessage
      }
      this._spectatorchatService.sendMessage(message)
      this.messages.push({from: this.current_user, text_content:this.newmessage})
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
