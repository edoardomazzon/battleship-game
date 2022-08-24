import { Component, OnInit } from '@angular/core';
import { SpectateService } from '../services/spectate.service';

@Component({
  selector: 'app-spectate',
  templateUrl: './spectate.component.html',
  styleUrls: ['./spectate.component.scss']
})
export class SpectateComponent implements OnInit {
  public player1field: Array<any> = new Array()
  public player2field: Array<any> = new Array()
  public player1: any
  public player2: any

  constructor(private _spectateService: SpectateService) { }

  ngOnInit(): void {
    var spectateinfo = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('spectateinfo'))))
    if(spectateinfo != null){
      this.player1 = spectateinfo.player1
      this.player2 = spectateinfo.player2
    }
    console.log(spectateinfo)
    // To do: initialize the two fields
  }

  spectate(){
    this._spectateService.spectate().subscribe((observer) => {

    })
  }

}
