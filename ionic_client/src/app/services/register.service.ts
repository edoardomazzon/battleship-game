import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private baseURL: string = 'http://192.168.188.23:3000/register'

  constructor(private _httpClient: HttpClient) { }

  addUser(user: User) {
    return this._httpClient.post(this.baseURL, user);
  }
}
