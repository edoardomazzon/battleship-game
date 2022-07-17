import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})

export class ProfileService {

  private usertoken: any;
  private baseURL: string = 'http://localhost:3000/myprofile';

  constructor(private _httpClient: HttpClient) { }

  //Modifichiamo il campo "authorization" dell'header così che contenga il token firmato
  //con utente e password da passare al server che poi lo decifrerà.
  private create_options() {
    return {
        headers: new HttpHeaders({
            authorization: 'Bearer ' + this.usertoken,
            'cache-control': 'no-cache',
            'Content-Type': 'application/json',
    })
  };
}

  profile() {
    //Prendiamo il token in storage e lo mandiamo al server
    this.usertoken = localStorage.getItem('auth_token');
    return this._httpClient.get(this.baseURL, this.create_options()).subscribe();
  }
}
