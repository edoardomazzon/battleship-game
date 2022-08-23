import { Component, OnInit } from '@angular/core';
import { ChatmessageService } from '../services/chatmessage.service';
import { GameService } from '../services/game.service';
import { MatchmakingService } from '../services/matchmaking.service';
import { HostListener } from '@angular/core';
import { TimeInterval } from 'rxjs/internal/operators/timeInterval';

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
  public myships: Array<any> = new Array() // Array that keeps track of our sunken ships and their orientation and length
  public placedShips: Array<any> = new Array() // Array containing the ships to be placed
  public enemyShips: Array<any> = new Array() // Array containint the enemy remaining ships
  public isplaying: Boolean
  public gamestarted: Boolean
  public myturn: Boolean
  public detectedenemyactivity: Boolean
  public timeout: any
  public timer: any // can be a number or null
  public interval: any
  public enemytimedout: Boolean
  public selectedShip: any
  public hasconfirmedpositioning: Boolean
  public hasplacedallships: Boolean
  public youwon: Boolean
  public youlost: Boolean
  public enemyleft: Boolean
  public enemywantsrematch: Boolean

  constructor(private _chatMessageService: ChatmessageService, private _gameService: GameService, private _matchMakingService: MatchmakingService) {
    this.resetPlacement()
    this.initMyShips()
    this.isplaying = false
    this.gamestarted = false
    this.myturn = false
    this.detectedenemyactivity = false
    this.selectedShip = 'none'
    this.hasplacedallships = false
    this.hasconfirmedpositioning = false
    this.youwon = false
    this.youlost = false
    this.enemyleft = false
    this.timer = null
    this.enemytimedout = false
    this.enemywantsrematch = false
    this.current_user = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))
    var matchinfo = localStorage.getItem('matchinfo')
    if(matchinfo){
      this.enemy = JSON.parse(matchinfo).enemy
    }
  }
  // If the user quits the game component, he loses the game
  @HostListener('window: beforeunload', ['$event'])
  unloadHandler(event: Event) {
    if(!this.youwon){this.leaveMatch('enemyleftwhileplaying')}
  }

  ngOnInit(): void {
    // Check if we came back to this game while we're still in a match; in that case we need to reload all the info
    // (who's turn it was, our ship placement, enemy's ship placement, our sunken ships, etc.)
    //*****//

    // Immediately start listening to various game-related events such as "enemyleft", "yougotshot", "enemyconfirmedpositioning", etc.
    this.startGame()
  }

  // If the user quits the game component, he loses the game
  ngOnDestroy(){
    if(!this.youwon){this.leaveMatch('enemyleftwhileplaying')}
  }

                      /* ------------------ PHASE 1: SHIP POSITIONING PHASE ------------------ */

  // Used to initialize our array of ships with length values and a boolean "sunk" value; if each of these ships is sunk, it means we lost
  initMyShips(){
    this.myships = new Array()
    var myships = [5, 4, 4, 3, 3, 3, 2, 2, 2, 2, 2]
    this.myships = new Array()

    for(let i = 0; i < myships.length; i++){
      this.myships.push({
        shiplength: myships[i],
        orientation: '',
        sunk: false
      })

    }
    this.placedShips = new Array()
    this.placedShips.push({ shiplength: 5, isselected: false, remaining: 1, orientation: ''})
    this.placedShips.push({ shiplength: 4, isselected: false, remaining: 2, orientation: ''})
    this.placedShips.push({ shiplength: 3, isselected: false, remaining: 3, orientation: ''})
    this.placedShips.push({ shiplength: 2, isselected: false, remaining: 5, orientation: ''})
    this.enemyShips = new Array()
    this.enemyShips.push({ shiplength: 5, remaining: 1})
    this.enemyShips.push({ shiplength: 4, remaining: 2})
    this.enemyShips.push({ shiplength: 3, remaining: 3})
    this.enemyShips.push({ shiplength: 2, remaining: 5})
  }

  // Once a user clicks on a ship of the positionable ships list, we update some internal fields (like the currently selected ship's length and orientation)
  selectShip(length: Number){
    for(let ship of this.placedShips){ ship.isselected = false }
    for(let ship of this.placedShips){
      if(ship.shiplength == length){
        ship.isselected = true
        ship.orientation = 'h'
        this.selectedShip = {length: length, orientation: ship.orientation}
        break
      }
    }
  }

  // Once a user clicks on a ship of the positionable ships list that is already selected, the ship gets deselected
  deselectShip(){
    for(let ship of this.placedShips){ ship.isselected = false }
    this.selectedShip = 'none'
  }

  // Rotates the selected ship from horizontal to vertical and vice versa (WHILE PLACING: doesn't work on already placed ships)
  rotateSelectedShip(x: any, y: any, length: any, orientation: String){
    if(this.selectedShip.orientation == 'h'){ this.selectedShip.orientation = 'v'}
    else if(this.selectedShip.orientation == 'v'){ this.selectedShip.orientation = 'h'}
    this.checkPlaceableOnHover(x, y, length, this.selectedShip.orientation)
    //this.previewShip(x, y, length, this.selectedShip.orientation, (this.isPlaceable(x, y, length, (this.selectedShip.orientatoin)).toString()))
  }

  // When a user selects the ship he wants to place and then hovers on a cell of his field, this gets updated accordingly with green or red cells
  checkPlaceableOnHover(x: any, y: any, length: any, orientation: any){
    if(this.isPlaceable(x, y, length, orientation)){
      this.previewShip(x, y, length, orientation, 'true')
    }
    else{ this.previewShip(x, y, length, orientation, 'false')}
  }

  // This function returns true if a ship of a certain length can be placed in the given coordinates.
  // By default this function works on horizontal placements, whereas for placing ships vertically it will be invoked after transposing the field
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

  // This function shows a preview ship placement; it will be shown red if not placeable, green otherwise
  previewShip(x: any, y: any, length: any, orientation: any, success: String){
    for(let row of this.myfield){
      for(let element of row){
        element.preview_success = 'none'
      }
    }
    if(orientation == "h"){
      for(let i = 0; i < length && x+i < 10; i++){
        this.myfield[y][x+i].preview_success = success
      }
    }
    else{
      for(let i = 0; i < length && y+i < 10; i++){
        this.myfield[y+i][x].preview_success = success
      }
    }
  }

  // This function places a ship on the given coordinates, orientation and with the given length
  placeShip(x: any, y: any, length: any, orientation: any){
    for(let ship of this.placedShips){ ship.isselected = false }
    this.selectedShip = 'none'
    for(let row of this.myfield){
      for(let element of row){
        element.preview_success = 'none'
      }
    }
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
    // Updating the placedShips array
    for(let i = 0, counter = 0; i < this.placedShips.length && counter == 0; i++){
      if(this.placedShips[i].shiplength == length){
        counter++
        this.placedShips[i].remaining -= 1
      }
    }
    // Checking if all the ships have been placed; in that case, this.hasplacedallships is set to TRUE
    var hasplacedallships = true
    for(let ship of this.placedShips){
      if(ship.remaining != 0){
        hasplacedallships = false
        break
      }
    }
    this.hasplacedallships = hasplacedallships
  }

  // This function un-does a ship placement; activated when a user right clicks on one of his positioned ships.
  // Basically does the same thing that placeShip() does, but this time it sets all values to 0 and all orientations to ''
  removeShip(x: any, y: any, length: any, orientation: any){
    for(let ship of this.placedShips){ ship.isselected = false }
    if(orientation == "h"){
      // Scanning left and right
      for(let i = 0; i < length && i < 10; i++){
        if(x+i < 10 && this.myfield[y][x+i].value == length){
          this.myfield[y][x+i].value = 0
          this.myfield[y][x+i].orientation = ''
        }
        else{ break }
      }
      for(let i = 1; i < length && i >= 0; i++){
        if(x-i >= 0 && this.myfield[y][x-i].value == length){
          this.myfield[y][x-i].value = 0
          this.myfield[y][x-i].orientation = ''
        }
        else{ break }
      }
    }
    else{
      // Scanning up and down
      for(let i = 0; i < length && i < 10; i++){
        if(y+i < 10 && this.myfield[y+i][x].value == length){
          this.myfield[y+i][x].value = 0
          this.myfield[y+i][x].orientation = ''
        }
        else{ break }
      }
      for(let i = 1; i < length && i >= 0; i++){
        if(y-i >= 0 && this.myfield[y-i][x].value == length){
          this.myfield[y-i][x].value = 0
          this.myfield[y-i][x].orientation = ''
        }
        else{ break }
      }
    }
    // Updating the placedShips array
    for(let i = 0, counter = 0; i < this.placedShips.length && counter == 0; i++){
      if(this.placedShips[i].shiplength == length){
        counter++
        this.placedShips[i].remaining += 1
      }
    }
    this.hasplacedallships = false
  }

  // This function uses all of the above to randomly place ships on the field
  randomPlaceShips(){
    this.hasplacedallships = false
    this.resetPlacement() // Deleting all ships from the field
    for (let i = 0; i < this.myships.length; i++){
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
          if(this.isPlaceable(x, y, this.myships[i].shiplength, "h")){
            this.placeShip(x, y, this.myships[i].shiplength, "h")
            isplaced = true
          }
          else if(this.isPlaceable(x, y, this.myships[i].shiplength, "v")){
            this.placeShip(x, y, this.myships[i].shiplength, "v")
            isplaced = true
          }
        }
        else{
          if(this.isPlaceable(x, y, this.myships[i].shiplength, "v")){
            this.placeShip(x, y, this.myships[i].shiplength, "v")
            isplaced = true
          }
          else if(this.isPlaceable(x, y, this.myships[i].shiplength, "h")){
            this.placeShip(x, y, this.myships[i].shiplength, "h")
            isplaced = true
          }
        }
      }
    }
  }

  // Used to reset the placement of the ships on our field
  resetPlacement(){
    this.hasplacedallships = false
    this.selectedShip = 'none'
    this.initMyShips()
    this.myfield = new Array()
    for(let i = 0; i < 10; i++){
      this.myfield[i] = new Array()
      for(let j = 0; j < 10; j++){
        this.myfield[i][j] = {
          value: 0,
          orientation: '',
          hit: false,
          preview_success: 'none'
        }
      }
    }
  }

  // Used to confirm our ship positioning; once this function is activated, we can no longer change the positionig
  confirmShipPlacement(){
    this._gameService.confirmShipPlacement(this.current_user.username, this.enemy)
    this.hasconfirmedpositioning = true
  }



                     /* ------------------ PHASE 2: PLAYING PHASE ------------------ */

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

  // Used to fire a shot at the enemy in the given coordinates (activated when a user clicks on those coordinates)
  fire(x: any, y: any){
    // this.myturn = false // Immediately prevent the user from shooting again for safety; since the hit confirmation arrives after
                        // the enemy sent it to us, it's better to keep the "myturn" variable to false in case this user spam-clicks
                        // other cells on the enemy field while the enemy is still calculating the response.
    this._gameService.fire(this.current_user.username, this.enemy, x, y)
    this.waitForEnemyActivity()
    this.detectedenemyactivity = false
  }
   // Function used to check if at the given coordinates and with given orientation the ship that's been hit is also sunk
   isSunk(x: any, y: any, length: any, orientation: any){
    if(orientation == 'h'){
      var row = this.myfield[x]
      var counter = 0
      for(let i = 0; i < length; i++){
        if(y+i >= 0 && y+i < 10 && row[y+i].value == length && row[y+i].hit){
          this.sunkship.push({x: x, y: y+i})
          counter++
        }else{ break }
      }
      for(let i = 1; i < length; i++){
        if(y-i >= 0 && y-i < 10 && row[y-i].value == length && row[y-i].hit){
          this.sunkship.push({x: x, y: y-i})
          counter++
        }else{ break }
      }
    }
    else{ // If orientation is "v" for vertical
      this.transpose(this.myfield)
      var row = this.myfield[y]
      var counter = 0
      for(let i = 0; i < length; i++){
        if(x+i >= 0 && x+i < 10 && row[x+i].value == length && row[x+i].hit){
          this.sunkship.push({x: x+i, y: y})
          counter++
        }else{ break }

      }
      for(let i = 1; i < length; i++){
        if(x-i >= 0 && x-i < 10 && row[x-i].value == length && row[x-i].hit){
          this.sunkship.push({x: x-i, y: y})
          counter++
        }else{ break }
      }
      this.transpose(this.myfield)
    }
    if(counter != length){
      this.sunkship = new Array()
    }
    return counter == length
  }

  // Used to update this.myships array by setting the "sunk" value to true of the corresponding sunk ship
  sinkShip(shiplength: any){
    for(let i = 0, counter = 0; i < this.myships.length && counter == 0; i++){
      if(this.myships[i].shiplength == shiplength && this.myships[i].sunk == false){
        counter++
        this.myships[i].sunk = true
      }
    }
    for(let ship of this.placedShips){ if(ship.shiplength == shiplength){ship.remaining -= 1 }}
  }

  // Marks the cells around the given coordinates as "water" if those coordinates have been hit and are part of a sunken ship,
  // as there can be no other ship sticking to the sunken one
  autoFillWater(x: any, y: any){
    if(this.enemyfield[x][y]== 'sunk'){
      if(this.enemyfield[x+1] && this.enemyfield[x+1][y] && this.enemyfield[x+1][y] != 'sunk'){this.enemyfield[x+1][y] = 'water'}
      if(this.enemyfield[x][y+1] && this.enemyfield[x][y+1] != 'sunk'){this.enemyfield[x][y+1] = 'water'}
      if(this.enemyfield[x-1] && this.enemyfield[x-1][y] && this.enemyfield[x-1][y] != 'sunk'){this.enemyfield[x-1][y] = 'water'}
      if(this.enemyfield[x][y-1] && this.enemyfield[x][y-1] != 'sunk'){this.enemyfield[x][y-1] = 'water'}
    }
  }

  // Returns true if all our ships have been sunk, false otherwise
  youLost(): Boolean{
    for(let ship of this.myships){
      if(!ship.sunk){
        return false
      }
    }
    return true
  }

  /* Activated when the user leaves the match; includes a "reason" parameter to specify the reason the user left:
     'enemtleftwhilepositioning', 'enemyleftwhileplaying', 'enemyleftafterwinning', 'other'; it could be that
     the user left after winning and not wanting a rematch, it could be that he left after losing, it could be that he left while
    starting the actual match or even during the positioning */
  leaveMatch(reason: String){
    this.detectedenemyactivity = true
    clearTimeout(this.timeout)
    this.stopTimer()
    if(reason == 'enemyleftwhileplaying' || reason == 'enemyleftwhilepositioning'){
      this.loseGame()
    }
    this._gameService.leaveMatch({current_user: this.current_user.username, enemy: this.enemy, message_type: reason}) // Notifying the other user that we left the match
    localStorage.removeItem('matchinfo')
  }

  // Used when the user wins a game: updates his games_won counter as well as his winstreak and the matche's "winner" field in the db
  winGame(){
    clearTimeout(this.timeout)

    var matchinfo = localStorage.getItem('matchinfo')
    var timestamp = ''
    if(matchinfo){
      timestamp = JSON.parse(matchinfo).starttime
    }
    this._gameService.winGameDB(this.current_user.username, this.enemy, timestamp)
    this.youwon = true
  }

  // Used when the user loses a game
  loseGame(){
    this.detectedenemyactivity = true
    clearTimeout(this.timeout)

    this.youlost = true
    this._gameService.loseGameDB(this.current_user.username)
  }

  startTimer(){
    this.timer = 10
    this.interval = setInterval(() => {
      if(this.timer <= 0){
        this.stopTimer()
      } else {this.timer -= 1}
    }, 1000)
  }

  stopTimer(){
    this.timer = null
    clearInterval(this.interval)
  }

  waitForEnemyActivity(){
    console.log('waiting for enemy activity')
    this.timeout = setTimeout(() => {
      if(!this.detectedenemyactivity){
        this.enemytimedout = true
        this._gameService.notifyEnemyTimeout(this.enemy)
        this._gameService.loseGameDB(this.enemy)
        this.winGame()
      }
    }, 10000)

  }

                    /* ------------------ PHASE 3: AFTER MATCH PHASE ------------------ */

  // Notifies the other player that we want a rematch
  askForRematch(){
    this._gameService.askForRematch({
      sender: this.current_user.username,
      receiver: this.enemy,
      message_type: 'requestrematch'
    })
  }

  // Accepting enemy's rematch request
  acceptRematch(){
    // Creates a new match at DB level (only the user that accepts the rematch will do this, otherwise it will be created twice)
    var newgametimestamp = new Date()
    var player1
    var player2
    if(this.current_user.username.localeCompare(this.enemy) < 0){ player1 = this.current_user.username; player2 = this.enemy }
    else{ player1 = this.enemy; player2 = this.current_user.username }
    this._matchMakingService.createMatch({
      player1: this.current_user.username,
      player2: this.enemy,
      winner: '',
      timestamp: newgametimestamp
    })
    // Notifying the other user that we accepted the rematch
    this._gameService.acceptRematch({
      sender: this.current_user.username,
      receiver: this.enemy,
      newtimestamp: newgametimestamp,
      message_type: 'acceptrematch'
    })
    // Updating the localstorage "matchinfo" item with the new starttime timestamp
    localStorage.removeItem('matchinfo')
    localStorage.setItem('matchinfo', JSON.stringify({enemy: this.enemy, isplaying: true, starttime: newgametimestamp}))
    this.prepareForRematch()
  }

  // When the two players agree on a rematch, the game is taken to its initial state
  prepareForRematch(){
    // Returning to the initial phase, which is the ship positioning phase
    clearTimeout(this.timeout)

    this.myturn = false
    this.gamestarted = false
    this.isplaying = false
    this.hasconfirmedpositioning = false
    this.youwon = false
    this.youlost = false
    this.enemyleft = false
    this.enemywantsrematch = false
    this.enemyfield = new Array()
    this.stopTimer()
    this.initMyShips()
    this.resetPlacement()
  }

  // Function invoked once both players have confirmed the ship positioning; once the game starts, the enemy field is initialized
  // With '?' values (meaning we don't know what is in that position) and the chat between the two users can start.
  startGame(){
    // Now we start listening to shots fired at us or to results of shots we fired at the enemy
    this._gameService.startGame(this.current_user.username, this.enemy).subscribe((message: any) => {
      // If the enemy confirms his ship positioning, we can start playing
      if(message.message_type == 'enemyconfirmed'){
        this.gamestarted = true
        this.placedShips = new Array()
        this.placedShips.push({ shiplength: 5, isselected: false, remaining: 1, orientation: ''})
        this.placedShips.push({ shiplength: 4, isselected: false, remaining: 2, orientation: ''})
        this.placedShips.push({ shiplength: 3, isselected: false, remaining: 3, orientation: ''})
        this.placedShips.push({ shiplength: 2, isselected: false, remaining: 5, orientation: ''})
        this.initEnemyField()
        this.myturn = (message.firstturn == this.current_user.username)
        this.startTimer()
        if(!this.myturn){ this.waitForEnemyActivity() }
        // Once the game starts the two players can also start chatting
        this._chatMessageService.startChat({
          current_user: this.current_user.username,
          other_user: this.enemy
        })
      }
      // If the enemy fires a shot in our field, we prepare the result that is to be given back to him with the shot results
      else if(message.message_type == 'yougotshot'){
        this.stopTimer()
        this.detectedenemyactivity = true
        clearTimeout(this.timeout)


        var shotresult = {
          message_type: 'shotresult',
          firing_user: this.enemy,
          fired_user: this.current_user.username,
          x: message.x,
          y: message.y,
          length: this.myfield[message.x][message.y].value,
          hit: false,
          sunk: false,
          sunkship: new Array(),
          youwon: false
        }
        if(this.myfield[message.x][message.y].value != 0){ // If there's a ship in the coordinates the enemy has shot
          this.myfield[message.x][message.y].hit = true
          shotresult.hit = true
          // If the ship the enemy hit has also been sunk
          if(this.isSunk(message.x, message.y, this.myfield[message.x][message.y].value, this.myfield[message.x][message.y].orientation)){
            shotresult.sunk = true
            this.sinkShip(this.myfield[message.x][message.y].value)
            for(let sunk of this.sunkship){
              shotresult.sunkship.push(sunk)
            }
            if(this.youLost()){ shotresult.youwon = true; this.loseGame()}
          }
        }
        else{this.myfield[message.x][message.y].value = -1; this.myturn = true;} // If the enemy misses then it's our turn
        this._gameService.sendShotResult(shotresult)
        if(shotresult.hit && !this.youlost){this.waitForEnemyActivity(); this.detectedenemyactivity = false }
        this.startTimer()
      }
      // If we shot and receive the result from the enemy we update our enemyfield with the appropriate symbols
      else if(message.message_type == 'shotresult'){
        this.stopTimer()
        this.detectedenemyactivity = true
        clearTimeout(this.timeout)

        if(message.hit){
          this.myturn = true
          this.enemyfield[message.x][message.y] = 'hit'
          if(message.sunk){
            for(let ship of this.enemyShips){ if(ship.shiplength == message.length){ ship.remaining -= 1 }}
            for(let coord of message.sunkship){
              this.enemyfield[coord.x][coord.y] = 'sunk'
              this.autoFillWater(coord.x, coord.y)
            }
            if(message.youwon){
              this.winGame()
            }
          }
        }
        else if(!message.hit){
          this.waitForEnemyActivity();
          this.detectedenemyactivity = false
          this.myturn = false
          this.enemyfield[message.x][message.y] = 'water'
        }
        this.startTimer()
        // After every shot we update the user's accuracy
        this._gameService.updateAccuracy(this.current_user.username, message.hit)
      }
      // If the nemy leaves while we're in the playing phase
      else if(message.message_type == 'enemyleftwhileplaying'){
        this.stopTimer()
        this.detectedenemyactivity = true
        clearTimeout(this.timeout)
        this.winGame()
        this.enemyleft = true
        setTimeout(()=>{
          this.leaveMatch("other")
        }, 4000)
      }
      // If the nemy leaves during the positioning phase
      else if(message.message_type == 'enemyleftwhilepositioning'){
        this.stopTimer()
        this.detectedenemyactivity = true
        clearTimeout(this.timeout)
        this.winGame()
        this.enemyleft = true
        setTimeout(()=>{
          this.leaveMatch("other")
        }, 4000)
      }
      // If the enemy leaves after he won and we were waiting to see if he wanted a rematch
      else if(message.message_type == 'enemyleftaftermatchended'){
        this.stopTimer()
        this.detectedenemyactivity = true
        clearTimeout(this.timeout)
        this.enemyleft = true
        setTimeout(()=>{
          this.leaveMatch("other")
        }, 4000)
      }
      // If the enemy wants a rematch after the game is finished
      else if(message.message_type == 'requestrematch'){
        this.detectedenemyactivity = true
        clearTimeout(this.timeout)
        this.enemywantsrematch = true // This will make the "accept rematch" button visible
      }
      // If the enemy accepted our rematch request after the game is finished
      else if(message.message_type == 'acceptrematch'){
        this.detectedenemyactivity = true
        clearTimeout(this.timeout)
        // Updating the localstorage "matchinfo" item with the new starttime timestamp
        localStorage.removeItem('matchinfo')
        localStorage.setItem('matchinfo', JSON.stringify({enemy: this.enemy, isplaying: true, starttime: message.newtimestamp}))
        this.prepareForRematch()
      }
      // If we didn't make a move in time
      else if(message.message_type == 'youtimedout'){
        this.detectedenemyactivity = true
        this.stopTimer()
        clearTimeout(this.timeout)

        this.loseGame()
      }
    })
  }
}
