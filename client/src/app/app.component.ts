import { Component } from '@angular/core';
import { AuthService} from './services/auth.service';
import { Router } from '@angular/router'


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'client';
  public is_authenticated: boolean = false
  constructor(public _authservice: AuthService,
              private _router: Router){
    this.is_authenticated = this._authservice.isAuthenticated()
  }

  onInit(){}

  gotoprofile(): void {
    this._router.navigateByUrl('/myprofile')
  }

  logoutUser(): void{
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
    this._router.navigateByUrl('/')
  }
}
