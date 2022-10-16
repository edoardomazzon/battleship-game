import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';


@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor() { }

  public isAuthenticated(): boolean {
    const jwthelper: JwtHelperService = new JwtHelperService()
    const token = localStorage.getItem('auth_token');
    if(token != null && token != undefined){
      return !jwthelper.isTokenExpired(token);
    }
    return false;
  }
}
