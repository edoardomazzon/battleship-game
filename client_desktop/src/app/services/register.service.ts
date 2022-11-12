import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  constructor(private _httpClient: HttpClient) { }
  addUser(user: User) {
    return this._httpClient.post("http://" + environment.ip_address + ":3000/register", user);
  }
}
