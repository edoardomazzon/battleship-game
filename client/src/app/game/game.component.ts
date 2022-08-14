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
    this.myfield= [ [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0] ];

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

  // By default this function works on horizontal placements, whereas for placing ships vertically it will be
  // invoked after rotating the myfield
  isPlaceableAux(x: any, y: any, length: any){
    var bool1 = true, bool2 = true, bool3 = true

    for(let i = -1; i <= length; i++){
      bool1 = (this.myfield[y][x+i] == 0 || this.myfield[y][x+i] == undefined)
      if(!bool1){ break }
    }
    for(let i = 0; i < length; i++){
      bool2 = (!this.myfield[y-1] || this.myfield[y-1][x+i] == 0 || this.myfield[y-1][x+i] == undefined)
      if(!bool2){ break }
    }
    for(let i = 0; i < length; i++){
      bool3 = (!this.myfield[y+1] || this.myfield[y+1][x+i] == 0 || this.myfield[y+1][x+i] == undefined)
      if(!bool3){ break }
    }

    return bool1 && bool2 && bool3

  }

  transpose(arr: any){
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < i; j++) {
        const tmp = arr[i][j];
        arr[i][j] = arr[j][i];
        arr[j][i] = tmp;
      };
    }
  }

  isPlaceable(x: any, y: any, length: any, orientation: any) {
    if (orientation == "h"){
      if (x > 10-length){ // Checking if x value exceeds field boundaries
        return false
      }
      else{
        return this.isPlaceableAux(x, y, length)
      }
    }

    else{
      if (y > 10-length){ // Checking if y value exceeds field boundaries
        return false
      }
      else{
          this.transpose(this.myfield)
        let res = this.isPlaceableAux(y, x, length)
          this.transpose(this.myfield)
        return res;
      }
    }
  }

  placeShip(x: any, y: any, length: any, orientation: any){
    if(orientation == "h"){
      for(let i = 0; i < length; i++){
        this.myfield[y][x+i] = length
      }
    }
    else{
      for(let i = 0; i < length; i++){
        this.myfield[y+i][x] = length
      }
    }
  }

  randomPlaceShips(){
    this.myfield = [[0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0]];
    var tobeplaced = [5, 4, 4, 3, 3, 3, 2, 2, 2, 2, 2]
    for (let i = 0; i < tobeplaced.length; i++){
      var isplaced = false
      while(!isplaced){
        var orientationpriority = Math.floor(Math.random() * 2);
        var x = Math.floor(Math.random() * 10);
        var y = Math.floor(Math.random() * 10);
        if(orientationpriority == 1){
          if(this.isPlaceable(x, y, tobeplaced[i], "h")){
            this.placeShip(x, y, tobeplaced[i], "h")
            isplaced = true
          }
          else if(this.isPlaceable(x, y, tobeplaced[i], "v")){
            this.placeShip(x, y, tobeplaced[i], "v")
            isplaced = true
          }
        }
        else{
          if(this.isPlaceable(x, y, tobeplaced[i], "v")){
            this.placeShip(x, y, tobeplaced[i], "v")
            isplaced = true
          }
          else if(this.isPlaceable(x, y, tobeplaced[i], "h")){
            this.placeShip(x, y, tobeplaced[i], "h")
            isplaced = true
          }
        }
      }
      console.log('POSIZIONATA LA NAVE DA ', tobeplaced[i])
    }
    console.log(this.myfield)
  }
}
