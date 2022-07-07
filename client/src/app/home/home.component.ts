import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserLogin } from '../models/user-login';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public newuser: UserLogin = new UserLogin()

  constructor(private _loginService: LoginService,
              private _router: Router) { }

  ngOnInit(): void {
  }

  loginUser(): void {
    console.log('printing user', this.newuser);
    this._loginService.login(this.newuser).subscribe(newuser =>{
      if (newuser){
        this._router.navigateByUrl('/login')
      }
    });
  

}
