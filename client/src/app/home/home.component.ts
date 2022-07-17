import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs';
import { ProfileService } from '../services/profile.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  private myprofileURL: string = 'http://localhost:3000/myprofile'
  constructor(private _httpClient: HttpClient,
              private _profileService: ProfileService,
              private _router: Router) { }

  ngOnInit(): void {}

  gotoprofile(): void {
    this._profileService.profile()
  }
}
