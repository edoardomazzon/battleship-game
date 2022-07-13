import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs';
import { ProfileService } from '../services/profile.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  private myprofileURL: string = 'http://localhost:3000/myprofile'
  constructor(private _httpClient: HttpClient,
              private _profileService: ProfileService) { }

  ngOnInit(): void {
  }

  gotoprofile(): void {
    this._profileService.profile();
  }
}
