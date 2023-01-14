import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private usertoken: any;

  constructor(private _httpClient: HttpClient) { }
  // Here we edit the header's "authorization" field so that it contains the signed token with username and password
  private create_options() {
    return {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.usertoken,
        'cache-control': 'no-cache',
        'Content-Type': 'application/json',
      })
    };
  }

  getUserInfo(): any{
    this.usertoken = localStorage.getItem('auth_token');
    this._httpClient.get("http://" + environment.ip_address + ":3000/myprofile", this.create_options()).subscribe((response) => {
      console.log(response)
      localStorage.removeItem('current_user')
      localStorage.setItem('current_user', JSON.stringify(response))
    });
  }
}
