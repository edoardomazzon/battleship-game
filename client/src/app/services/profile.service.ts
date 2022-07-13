import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private usertoken: any;
  private baseURL: string = 'http://localhost:3000/myprofile'
  constructor(private _httpClient: HttpClient) { }

  private create_options() {
    return {
        headers: new HttpHeaders({
            authorization: 'Bearer ' + this.usertoken
        })
    };

}
  profile() {
    this.usertoken = localStorage.getItem('auth_token');
    return this._httpClient.get(this.baseURL, this.create_options()).subscribe();
  }
}
