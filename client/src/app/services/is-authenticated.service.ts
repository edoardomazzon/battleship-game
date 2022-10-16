import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})

export class IsAuthenticatedService implements CanActivate {

  constructor(public _auth: AuthService,
              public _router: Router) { }

  canActivate(): boolean {
    if (!this._auth.isAuthenticated()) {
      this._router.navigateByUrl('/login')
      return false;
    }
    return true;
  }
}


