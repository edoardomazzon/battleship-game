import { Component, OnInit } from '@angular/core';
import { ChatmessageService } from '../services/chatmessage.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  private player1: any;
  private player2: any;
  public messages: any = [];
  public newmessage: String =''

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

    this.getMessages()
    this._chatmessageservice.receiveMessages().subscribe((message) => { //per ora mettiamo broadcast finché facciamo le prove, poi metteremo channel_name
      this.messages.push(message) //Inserisco il messaggio inviato nella lista messages senza dover fare la query
      this.messages.shift() //Shifto l'array di una posizione per eliminare il messaggio più vecchio
    })
  }

  public getMessages(){
    this.messages = this._chatmessageservice.getMessagesFromDb(this.player1, this.player2)
  }

  //Invia un messaggio quando l'utente preme sul bottone "invia"
  public sendMessage(){
    if(this.newmessage != ''){
      const sent_message = this.newmessage
      this.newmessage = ''
      this._chatmessageservice.sendMessage({from: this.player1, to: this.player2, text_content: sent_message})
    }
  }
}
