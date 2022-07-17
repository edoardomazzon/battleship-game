import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs';
import { ProfileService } from '../services/profile.service';
import { User } from '../models/user';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
  private baseURL: string = 'http://localhost:3000/myprofile'
  public current_user: any;

  constructor(private _httpClient: HttpClient,
              private _profileService: ProfileService) { }

  ngOnInit(): void {
    //Prendiamo il json in localStorage che contiene i dati dell'utente loggato
    this.current_user = localStorage.getItem('current_user')
    if (this.current_user != null){ //Se l'utente è stato trovato perché è loggato
      this.current_user = JSON.parse(this.current_user)
    } else { this.current_user = new User();} //Se l'utente non è stato trovato allora ne creiamo uno vuoto
                                              //Altrimenti avremmo un errore nell'html
  }
}
