import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-userinfo',
  templateUrl: './userinfo.component.html'
})
export class UserinfoComponent implements OnInit {

  public expanded: Boolean
  public username: String
  public winrate: Number;
  public current_winstreak: Number;
  public accuracy: Number;

  // With these we can pass a parameter named "[title]" from other HTML components (see home.component.html or game.component.html)
  @Input()
  title!: string;

  constructor(private _httpClient: HttpClient) {
    this.expanded = false
    this.username = ""
    this.winrate = 0
    this.current_winstreak = 0
    this.accuracy = 0
  }

  ngOnInit(): void {
    this.username = this.title
    this._httpClient.post("http://192.168.244.40:3000/userinfo", { username: this.username}).subscribe((response: any) => {
      this.accuracy = response.accuracy
      this.winrate = response.winrate
      this.current_winstreak = response.current_winstreak
    })
  }

  toggleExpand(){
    this.expanded = !this.expanded
  }
}
