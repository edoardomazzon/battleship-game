import { Component, OnInit } from '@angular/core';
import { ChatmessageService } from '../services/chatmessage.service';
import { GameService } from '../services/game.service';
import { MatchmakingService } from '../services/matchmaking.service';

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
  public myships: Array<any> = new Array()
  public isplaying: Boolean
  public gamestarted: Boolean
  public myturn: Boolean
  public hasconfirmedpositioning: Boolean
  public youwon: Boolean
  public youlost: Boolean
  public enemyleft: Boolean
  public enemywantsrematch: Boolean
  private isarematch: Boolean

  constructor(private _chatMessageService: ChatmessageService, private _gameService: GameService, private _matchMakingService: MatchmakingService) {
    this.resetPlacement()
    this.initMyShips()
    this.isplaying = false
    this.gamestarted = false
    this.myturn = false
    this.hasconfirmedpositioning = false
    this.youwon = false
    this.youlost = false
    this.enemyleft = false
    this.enemywantsrematch = false
    this.isarematch = false
    this.current_user = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))
    var matchinfo = localStorage.getItem('matchinfo')
    if(matchinfo){
      this.enemy = JSON.parse(matchinfo).enemy
    }
  }

  ngOnInit(): void {
    // Check if we came back to this game while we're still in a match; in that case we need to reload all the info
    // (who's turn it was, our ship placement, enemy's ship placement, our sunken ships, etc.)
    //*****//

    // Immediately start listening to various game-related events such as "enemyleft", "yougotshot", "enemyconfirmedpositioning", etc.
    this.startGame()
  }

                      /* ------------------ PHASE 1: SHIP POSITIONING PHASE ------------------ */

  // Used to initialized our array of ships with length values and a boolean "sunk" value; if each of these ships is sunk, it means we lost
  initMyShips(){
    this.myships = new Array()
    var myships = [5, 4, 4, 3, 3, 3, 2, 2, 2, 2, 2]
    for(let i = 0; i < myships.length; i++){
      this.myships.push({
        shiplength: myships[i],
        sunk: false
      })
    }
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
    console.log('placing ships randomly')
    this.resetPlacement() // Deleting all ships from the field
    this.initMyShips()
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
    this.myturn = false // Immediately prevent the user from shooting again for safety; since the hit confirmation arrives after
                        // the enemy sent it to us, it's better to keep the "myturn" variable to false in case this user spam-clicks
                        // other cells on the enemy field while the enemy is still calculating the response.
    this._gameService.fire(this.current_user.username, this.enemy, x, y)
  }

  // Function used to check if at the given coordinates and with given orientation the ship that's been hit is also sunk
  isSunk(x: any, y: any, length: any, orientation: any){
    if(orientation == 'h'){
      var row = this.myfield[x]
      var counter = 0
      for(let i = -(length-1); i < length; i++){
        if(y+i >= 0 && y+i < 10 && row[y+i].value == length && row[y+i].hit){
          this.sunkship.push({x: x, y: y+i})
          counter++
        }
      }
    }
    else{
      this.transpose(this.myfield)
      var row = this.myfield[y]
      var counter = 0
      for(let i = -(length-1); i < length; i++){
        if(x+i >= 0 && x+i < 10 && row[x+i].value == length && row[x+i].hit){
          this.sunkship.push({x: x+i, y: y})
          counter++
        }
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
    if(reason == 'enemyleftwhileplaying' || reason == 'enemyleftwhilepositioning'){
      this.loseGame()
    }
    if(reason != 'other'){
      this._gameService.leaveMatch({winner: this.enemy, message_type: reason}) // Notifying the other user that we left the match
    }
    localStorage.removeItem('matchinfo')
    this.isarematch = false
    this.myturn = false
    this.isplaying = false
    this.gamestarted = false
    this.hasconfirmedpositioning = false
    this.enemy = null
    this.enemyleft = false
    this.initEnemyField()
    this.initMyShips()
    this.resetPlacement()
    location.reload()
  }

  // Used when the user wins a game: updates his games_won counter as well as his winstreak and the matche's "winner" field in the db
  winGame(){
    console.log("WE WIN")
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
    this.youlost = true
    this._gameService.loseGameDB(this.current_user.username)
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
    this.isarematch = true
    this.myturn = false
    this.gamestarted = false
    this.isplaying = false
    this.hasconfirmedpositioning = false
    this.youwon = false
    this.youlost = false
    this.enemyleft = false
    this.enemywantsrematch = false
    this.enemyfield = new Array()
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
        this.initEnemyField()
        this.myturn = (message.firstturn == this.current_user.username)
        // Once the game starts the two players can also start chatting
        this._chatMessageService.startChat({
          current_user: this.current_user.username,
          other_user: this.enemy
        })
      }
      // If the enemy fires a shot in our field, we prepare the result that is to be given back to him with the shot results
      else if(message.message_type == 'yougotshot'){
        var shotresult = {
          message_type: 'shotresult',
          firing_user: this.enemy,
          fired_user: this.current_user.username,
          x: message.x,
          y: message.y,
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
        else{this.myturn = true} // If the enemy misses then it's our turn
        this._gameService.sendShotResult(shotresult)

      }
      // If we shot and receive the result from the enemy we update our enemyfield with the appropriate symbols
      else if(message.message_type == 'shotresult'){
        if(message.hit){
          this.myturn = true
          this.enemyfield[message.x][message.y] = 'hit'
          if(message.sunk){
            for(let coord of message.sunkship){
              this.enemyfield[coord.x][coord.y] = 'sunk'
            }
            if(message.youwon){
              this.winGame()
            }
          }
        }
        else if(!message.hit){
          this.enemyfield[message.x][message.y] = 'water'
        }
        // After every shot we update the user's accuracy
        this._gameService.updateAccuracy(this.current_user.username, message.hit)
      }
      // If the nemy leaves while we're in the playing phase
      else if(message.message_type == 'enemyleftwhileplaying'){
        console.log('ENEMY LEFT WHILE PLAYING SO YOU WIN')
        this.winGame()
        this.enemyleft = true
        setTimeout(()=>{
          this.leaveMatch("other")
        }, 4000)
      }
      // If the nemy leaves during the positioning phase
      else if(message.message_type == 'enemyleftwhilepositining'){
        console.log('ENEMY LEFT WHILE POSITIONING HIS SHIPS')
        this.winGame()
        this.enemyleft = true
        setTimeout(()=>{
          this.leaveMatch("other")
        }, 4000)
      }
      // If the enemy leaves after he won and we were waiting to see if he wanted a rematch
      else if(message.message_type == 'enemyleftaftermatchended'){
        console.log('ENEMY LEFT SO YOU CAN\'T GET A REMATCH')
        this.enemyleft = true
        setTimeout(()=>{
          this.leaveMatch("other")
        }, 4000)
      }
      // If the enemy wants a rematch after the game is finished
      else if(message.message_type == 'requestrematch'){
        this.enemywantsrematch = true // This will make the "accept rematch" button visible
      }
      // If the enemy accepted our rematch request after the game is finished
      else if(message.message_type == 'acceptrematch'){
        console.log('enemy accepted our rematch request')
        // Updating the localstorage "matchinfo" item with the new starttime timestamp
        localStorage.removeItem('matchinfo')
        localStorage.setItem('matchinfo', JSON.stringify({enemy: this.enemy, isplaying: true, starttime: message.newtimestamp}))
        this.prepareForRematch()
      }
    })
  }
}

