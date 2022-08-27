import { Component, OnInit } from '@angular/core';
import { SpectateService } from '../services/spectate.service';

@Component({
  selector: 'app-spectate',
  templateUrl: './spectate.component.html',
  styleUrls: ['./spectate.component.scss']
})
export class SpectateComponent implements OnInit {
  private current_user: any
  public player1field: Array<any> = new Array()
  public player2field: Array<any> = new Array()
  public player1: any
  public player2: any
  public winner: String
  public gameended: Boolean
  public turnplayer1: Boolean
  public turnplayer2: Boolean

  constructor(private _spectateService: SpectateService) {
    this.current_user = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))
    this.turnplayer1 = false
    this.turnplayer2 = false
    this.gameended = false
    this.winner = ''
  }

  ngOnInit(): void {
    var spectateinfo = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('spectateinfo'))))
    this.player1 = spectateinfo.player1
    this.player2 = spectateinfo.player2
    this.initFields()
    this.spectate()
  }

  // Immediately start listening to spectating events (a player places/removes a ship, the playing phase starts, a user shoots,
  // sinks or misses a ship). Each emit contains the new field after a ship placement or after a shot result.
  spectate(){
    this._spectateService.spectate(this.player1, this.player2).subscribe((message) => {
      // If a player notifies us that he shot the enemy, he also sends us a new enemyfield that we have to substitute to the current
      // player1 or player2 is, depending on who the enemy is. The field in the message is already in the same format as "player1field"
      // and "player2field".
      if(message.message_type == 'newenemyfieldshot'){
        if(message.enemy == this.player1){
          this.player1field = message.newenemyfield
        } else { this.player2field = message.newenemyfield }
      }
      // If a player notifies us that he placed or removed a ship, he sends us a new field to be substituted to his current field.
      else if(message.message_type == 'newfieldpositioning'){
        if(message.player == this.player1){
          this.player1field = message.newfieldpositioning
        } else { this.player2field = message.newfieldpositioning }
      }
      // If a player notifies us that he won the match
      else if(message.message_type == 'matchended'){
        this.gameended = true
        this.winner = message.player1 // in the game component, "player1" is the current user, so the user who won the game
      }
      // If the players agree to a rematch, the component gets reset and the spectators can continue spectating the two players.
      else if(message.message_type == 'playersrematch'){
        this.initFields()
      }
    })
  }

  // A spectator doesn't require any particular field cells values, unlike the actual players. All a spectator must do is to visualize
  // both players' fields in the positioning phase and during the playing phase; that's why each cell has only one value and not multiple
  // fields (for instance, in game.component.ts, "myfield" has 4 fields: value, orientation, hit, preview_success).
  // In this component, a cell can be: 'empty', 'placed', 'hit', 'sunk', 'water'.
  initFields(){
    this.player1field = new Array()
    this.player1field = new Array()

    for(let i = 0; i < 10; i++){
      this.player1field[i] = new Array()
      this.player2field[i] = new Array()
      for(let j = 0; j < 10; j++){
        this.player1field[i][j] = 'empty'
        this.player2field[i][j] = 'empty'
      }
    }
    this.gameended = false
    this.winner = ''
  }
}
