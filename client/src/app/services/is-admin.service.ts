import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import jwt_decode from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class IsAdminService implements CanActivate{

  constructor(public _router: Router) { }

  canActivate(): boolean{
    var auth_token = localStorage.getItem('auth_token')
    if(auth_token != null){
      var role = JSON.parse(JSON.stringify(jwt_decode(auth_token))).role
      console.log(role)
      if (role != 'admin'){
        this._router.navigateByUrl('/')
        return false;
      }
      return true
    }
    this._router.navigateByUrl('/')
    return false
  }

  isAdmin(): boolean{
    var auth_token = localStorage.getItem('auth_token')
    if(auth_token != null){
      var role = JSON.parse(JSON.stringify(jwt_decode(auth_token))).role
      if (role != 'admin'){
        return false;
      }
      return true
    }
    return false
  }
}
