import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
  private baseURL: string = 'http://localhost:3000/myprofile'

  constructor(private _httpClient: HttpClient,
              private _profileService: ProfileService) { }
  ngOnInit(): void {
    /*console.log("entra in  root")
    let mytoken = this._profileService.profile();
    console.log(mytoken);
    this.gotoprofile()*/
  }

  gotoprofile() {
    /*console.log("chiamata goto profile");
    let ris=this._profileService.profile();
    console.log(ris)*/
  }
}
