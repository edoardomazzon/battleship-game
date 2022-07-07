//Funziona come register.services.ts quindi vedere i commenti per quello

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserLogin } from '../models/user-login';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private baseURL: string = 'http://localhost:3000/login'

  constructor(private _httpClient: HttpClient) { }

  login(userLogin: UserLogin) {
    return this._httpClient.post(this.baseURL, userLogin);
  }

}
