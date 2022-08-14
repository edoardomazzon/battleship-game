import { Component, OnInit } from '@angular/core';
import { ChatmessageService } from '../services/chatmessage.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  public current_user: any
  public enemy: any
  public myfield: any // Matrix containing the user's ships' positions
  public enemyfield: any // Matrix containing enemy's ships' positions

  constructor(private _chatMessageService: ChatmessageService) {
    this.current_user = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))
    this.enemy = localStorage.getItem('matchinfo')
    if(this.enemy){
      this.enemy = JSON.parse(this.enemy).enemy
    }
    this._chatMessageService.startChat({
      current_user: this.current_user.username,
      other_user: this.enemy
    })
  }

  ngOnInit(): void {
  }

}
