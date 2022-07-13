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
  public token: any;
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
        console.log(JSON.stringify(data));
        this.token = data;
        this.token = this.token.token;
        localStorage.setItem('auth_token', this.token);
      }));
  }
}
