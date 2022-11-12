//Funziona come register.services.ts quindi vedere i commenti per quello
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { UserLogin } from '../models/user-login';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
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
    // Receiving a response from the server; such respons can return an "error" string
    // or the user's info with some optional additional clues such as "banned" or "needspasswordchange"
    return this._httpClient.get("http://" +environment.ip_address +":3000/login", options).pipe(tap( (data) => {
        this.response = data;
        if(this.response != 'error'){
          if(this.response != 'banned'){
            if(this.response.needspasswordchange != undefined &&
              this.response.needspasswordchange != null &&
              this.response.needspasswordchange == true){
              localStorage.clear()
              localStorage.setItem('username', JSON.stringify(this.response.username))
            }
            else{
              localStorage.clear()
              // Saving the authentication token and user info in the browser's LocalStoragae
              this.token = this.response.token;
              localStorage.setItem('auth_token', this.token);
              this.user = this.response.user;
              localStorage.setItem('current_user', JSON.stringify(this.user));
            }
          }
        }
      }));
  }
}
