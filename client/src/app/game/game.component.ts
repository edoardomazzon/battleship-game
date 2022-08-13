import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  public current_user: any
  public enemy: any
  constructor() {
    this.current_user = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))
    this.enemy = localStorage.getItem('matchinfo')
    if(this.enemy){
      this.enemy = JSON.parse(this.enemy).enemy
    }
  }

  ngOnInit(): void {
  }

}
