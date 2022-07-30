import { Component, OnInit } from '@angular/core';
import { ChatMessage } from '../models/chatmessage';
import { ChatmessageService } from '../services/chatmessage.service';



@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  private player1: any;
  private player2: any;
  public messages: any[] = [];

  constructor(private _chatmessageservice: ChatmessageService) {
    this.player1 = localStorage.getItem('current_user')
    if(this.player1){
      this.player1 = JSON.parse(this.player1)
      this.player1 = this.player1.username
    }
    this.player2 = 'Ikonik' //Per ora lasciamo fisso il player 2 finché non capiamo come creare una chat con due giocatori qualsiasi
    //Per capire chi è il player 2 facciamo che quando inizia la partita ognuno si salva in localstorage il nome dell'avversario e da qui
    //si fa this.player2 = localStorage.getItem('enemy').username
  }


  ngOnInit(): void {
    var channel_name = ''

    //Ordiniamo alfabeticamente i nomi degli utenti così otteniamo per entrambi un nome comune del canale su cui comunicare,
    //Perché se uno si aspetta dei messaggi su USER1USER2 ma l'altro li emette sul canale USER2USER1 non li riceverà mai
    if(this.player1.localeCompare(this.player2) < 0){
        channel_name = ''+this.player1+''+this.player2
    }else{
        channel_name = ''+this.player2+''+this.player1
    }
    console.log('IL CHANNEL NAME DEL CLIENT E\': ', channel_name)
    this.getMessages()
    this._chatmessageservice.receiveMessage(channel_name).subscribe((message) => {
      this.getMessages()
    })
  }

  public getMessages(){
    this.messages = this._chatmessageservice.getMessagesFromDb(this.player1, this.player2)
  }

}
