//Funziona come register.services.ts quindi vedere i commenti per quello
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { UserLogin } from '../models/user-login';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private baseURL: string = 'http://localhost:3000/login'
  public response: any;
  public token: any;
  public user: any;
  constructor(private _httpClient: HttpClient) { }

  login(userLogin: UserLogin) : Observable < any >  {
    const options = {
      headers: new HttpHeaders({
          Authorization: 'Basic ' + btoa(userLogin.username + ':' + userLogin.password),
          'cache-control': 'no-cache',
          'Content-Type': 'application/x-www-form-urlencoded'
      })
    };

    return this._httpClient.get(this.baseURL, options).pipe(
      tap( (data) => {
        //Otteniamo la response dal server (vedere route login.js in server per capire com'è fatta la response)
        this.response = data;
        localStorage.clear()
        //Salviamo in localstorage il token
        this.token = this.response.token;
        localStorage.setItem('auth_token', this.token);

        //Salviamo in localstorage l'utente per averne i dati comodamente estraibili in seugito
        this.user = this.response.user;
        localStorage.setItem('current_user', JSON.stringify(this.user));
      }));
  }
}
