import { Xliff2 } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { ChatmessageService } from '../services/chatmessage.service';
import { GameService } from '../services/game.service';

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
  private sunkship: Array<any> = new Array() // Array containing the coordinates of the ship our enemy has sunk
  public isplaying: Boolean
  public gamestarted: Boolean
  public myturn: Boolean
  public hasconfirmedpositioning: Boolean

  constructor(private _chatMessageService: ChatmessageService, private _gameService: GameService) {
    this.resetPlacement()
    this.isplaying = false
    this.gamestarted = false
    this.myturn = false
    this.hasconfirmedpositioning = false
    this.current_user = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))
    this.enemy = localStorage.getItem('matchinfo')
    if(this.enemy){
      this.enemy = JSON.parse(this.enemy).enemy
    }
  }

  ngOnInit(): void {
    // As soon as the game component is loaded, we start waiting for the enemy to confirm his positoning (in case we don't confirm first)
    this.waitForConfirmation()
  }


  // Used to initialize the enmy field with empty cells; '?' means we don't know what it's in the cell, 'water' means we shot
  // at it but didn't hit any ship, 'hit' means we shot at it and hit a ship, 'sunk' means that that cell is a part of a sunken ship
  initEnemyField(){
    this.enemyfield = new Array()
    for(let i = 0; i < 10; i++){
      this.enemyfield[i] = new Array()
      for(let j = 0; j < 10; j++){
        this.enemyfield[i][j] = '?'
      }
    }
  }

  // Used to reset the placement of the ships on our field
  resetPlacement(){
    this.myfield = new Array()
    for(let i = 0; i < 10; i++){
      this.myfield[i] = new Array()
      for(let j = 0; j < 10; j++){
        this.myfield[i][j] = {
          value: 0,
          orientation: '',
          hit: false
        }
      }
    }
  }

  // Used to confirm our ship positioning; once this function is activated, we can no longer change the positionig
  confirmShipPlacement(){
    this._gameService.confirmShipPlacement(this.current_user.username, this.enemy)
    this.hasconfirmedpositioning = true
    this.waitForConfirmation()
  }

  // Used to wait for our enemy to confirm his own ship positioning; once the server tells us that our enemy has
  // confirmed his positioning, the came can start for both users
  waitForConfirmation(){
    this._gameService.waitForConfirmation(this.current_user.username).subscribe((observer: any)=>{
      if(observer.message_type == 'enemyconfirmed'){
        this.startGame()
      }
    })
  }

  // This function returns true if a ship of a certain length can be placed in the given coordinates.
  // By default this function works on horizontal placements, whereas for placing ships vertically it will be
  // invoked after transposing
  isPlaceableAux(x: any, y: any, length: any){
    var bool1 = true, bool2 = true, bool3 = true

    for(let i = -1; i <= length; i++){
      bool1 = (!this.myfield[y][x+i] || this.myfield[y][x+i].value == 0 || this.myfield[y][x+i].value == undefined)
      if(!bool1){ break }
    }
    for(let i = 0; i < length; i++){
      bool2 = (!this.myfield[y-1] || this.myfield[y-1][x+i].value == 0 || this.myfield[y-1][x+i].value == undefined)
      if(!bool2){ break }
    }
    for(let i = 0; i < length; i++){
      bool3 = (!this.myfield[y+1] || this.myfield[y+1][x+i].value == 0 || this.myfield[y+1][x+i].value == undefined)
      if(!bool3){ break }
    }
    return bool1 && bool2 && bool3
  }

  // This function trasposes a matrix and it's used before invoking isPlaceableAux() in case of a vertical placement.
  // It will also be invoked after isPlaceableAux() to re-transpose the matrix into its original state
  transpose(matrix: any){
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < i; j++) {
        const tmp = matrix[i][j];
        matrix[i][j] = matrix[j][i];
        matrix[j][i] = tmp;
      };
    }
  }

  // Given the coordinates, the length of the ship and its orientation ("v" for vertical and "h" for horizontal), this function
  // returns true if said ship is placeable as dictated by the game rules.
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
        // Notice how we don't pass the orientation as a parameter since we already transposed the matrix
        let res = this.isPlaceableAux(y, x, length)
        this.transpose(this.myfield)
        return res;
      }
    }
  }

  // This function places a ship on the given coordinates, orientation and with the given length
  placeShip(x: any, y: any, length: any, orientation: any){
    if(orientation == "h"){
      for(let i = 0; i < length; i++){
        this.myfield[y][x+i].value = length
        this.myfield[y][x+i].orientation = 'h'
      }
    }
    else{
      for(let i = 0; i < length; i++){
        this.myfield[y+i][x].value = length
        this.myfield[y+i][x].orientation = 'v'
      }
    }
  }

  // This function uses all of the above to randomly place ships on the field
  randomPlaceShips(){
    this.resetPlacement() // Deleting all ships from the field
    var tobeplaced = [5, 4, 4, 3, 3, 3, 2, 2, 2, 2, 2] // Stating the number and length of the ships to be placed

    for (let i = 0; i < tobeplaced.length; i++){
      var isplaced = false
      while(!isplaced){
        // This variable is used to avoid prioritizing horizontal or vertical horientation. If set to 1, this function will try
        // horizontal first and then vertical (in case the ship can't be placed horizontally). If set to 0, the function will
        // try a vertical placement first follow by a horizontal one.
        var orientationpriority = Math.floor(Math.random() * 2);
        // Selecting random coordinates
        var x = Math.floor(Math.random() * 10);
        var y = Math.floor(Math.random() * 10);

        // Based on the orientation priority, first we check if that ship is placeable in the randomly chosen coordinates; if it's
        // placeable then it will be placed and we'll move on with the next ship by setting "isplaced = true" to exit the while loop
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
    }
  }

  // Function invoked once both players have confirmed the ship positioning; once the game starts, the enemy field is initialized
  // With '?' values (meaning we don't know what is in that position) and the chat between the two users can start.
  startGame(){
    this.gamestarted = true
    this.initEnemyField()
    this._gameService.startGame(this.current_user.username, this.enemy).subscribe((observer: any) => {
      // If the enemy fires a shot in our field, we prepare the result that is to be given back to him with the shot results
      if(observer.message_type == 'yougotshot'){
        var shotresult = {
          message_type: 'shotresult',
          firing_user: this.enemy,
          fired_user: this.current_user.username,
          x: observer.x,
          y: observer.y,
          hit: false,
          sunk: false,
          sunkship: new Array(),
          youwon: false
        }
        if(this.myfield[observer.x][observer.y].value != 0){ // If there's a ship in the coordinates the enemy has shot
          this.myfield[observer.x][observer.y].hit = true
          shotresult.hit = true
          // If the ship the enemy hit has also been sunk
          if(this.isSunk(observer.x, observer.y, this.myfield[observer.x][observer.y].value, this.myfield[observer.x][observer.y].orientation)){
            shotresult.sunk = true
            for(let sunk of this.sunkship){
              shotresult.sunkship.push(sunk)
            }
            // if(this.youLost){ shotresult.youwon = true}
          }
        }
        this._gameService.sendShotResult(shotresult)
      }

      // If we shot and receive the result from the enemy we update our enemyfield with the appropriate symbols
      else if(observer.message_type == 'shotresult'){
        if(observer.hit){
          this.enemyfield[observer.x][observer.y] = 'hit'
          if(observer.sunk){
            for(let coord of observer.sunkship){
              this.enemyfield[coord.x][coord.y] = 'sunk'
            }
          }
        }
        else if(!observer.hit){
          this.enemyfield[observer.x][observer.y] = 'water'
        }
        // After every shot we update the user's accuracy
        this._gameService.updateAccuracy(this.current_user.username, observer.hit)
      }
    })

    // Once the game starts the two players can also start chatting
    this._chatMessageService.startChat({
      current_user: this.current_user.username,
      other_user: this.enemy
    })
  }

  // Used to fire a shot at the enemy in the given coordinates (activated when a user clicks on those coordinates)
  fire(x: any, y: any){
    console.log('firing at', x, y)
    this._gameService.fire(this.current_user.username, this.enemy, x, y)
  }

  // Function used to check if at the given coordinates and with given orientation the ship that's been hit is also sunk
  isSunk(x: any, y: any, length: any, orientation: any){
    if(orientation == 'h'){
      var row = this.myfield[x]
      var counter = 0
      for(let i = -(length-1); i < (9-y + (length - (length-1))) && i < 10; i++){
        if(y+i >= 0 && row[y+i].value == length && row[y+i].hit){
          this.sunkship.push({x: x, y: y+i})
          counter++
        }
      }
    }
    else{
      this.transpose(this.myfield)
      var row = this.myfield[y]
      var counter = 0
      for(let i = -(length-1); i < (9-x + (length - (length-1))) && i < 10; i++){
        if(x+i >= 0 && row[x+i].value == length && row[x+i].hit){
          this.sunkship.push({x: x+i, y: y})
          counter++
        }
      }
      this.transpose(this.myfield)
    }
    if(counter != length){ this.sunkship = new Array()}

    return counter == length
  }
}

