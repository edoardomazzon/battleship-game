import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { AuthService} from '../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private _router: Router,
              public _authservice: AuthService) { }

  ngOnInit(): void {
  }
  gotoprofile(): void {
    this._router.navigateByUrl('/myprofile')
  }

  logoutUser(): void{
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
    this._router.navigateByUrl('/')
    location.reload()
  }

}
