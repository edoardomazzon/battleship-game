import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserLogin } from '../models/user-login';
import { LoginService } from '../services/login.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})

export class LoginComponent implements OnInit {
  public yourebanned: Boolean
  public authuser: UserLogin = new UserLogin()
  public changing_password: Boolean
  public firstpasswordchangefield: string
  public secondpasswordchangefield: string
  public warnpasswordmismatch: Boolean
  public wrongcredentials: Boolean
  private baseURL = `http://${environment.ip_address}:3000/login`

  constructor(private _loginService: LoginService, private _router: Router, private _httpClient: HttpClient) {
    this.yourebanned = false
    this.wrongcredentials = false
    this.changing_password = false
    this.firstpasswordchangefield = ''
    this.secondpasswordchangefield = ''
    this.warnpasswordmismatch = false
  }
  ngOnInit(){}
  loginUser(){
    this._loginService.login(this.authuser).subscribe(authuser =>{
      if (authuser == 'error'){
        this.wrongcredentials = true
      }
      else if (authuser == 'banned'){
        this.wrongcredentials = false
        this.yourebanned = true
      }
      else if(authuser.needspasswordchange){
        this.wrongcredentials = false
        this.changing_password = true
      }
      else{
        this.wrongcredentials = false
        this.yourebanned = false
        this._router.navigateByUrl('/')
      }
    });
  }

  goToRegister(){
    this._router.navigateByUrl('/register')
  }

  checkPasswordMismatch(){
    if(this.secondpasswordchangefield != ''){
      this.warnpasswordmismatch = (this.firstpasswordchangefield != this.secondpasswordchangefield)
    }
    else{
      this.warnpasswordmismatch = false
    }
  }

  changePassword(newpassword: string){
    if(this.firstpasswordchangefield == this.secondpasswordchangefield && this.firstpasswordchangefield != '' && this.secondpasswordchangefield != ''){
      const username = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('username'))))
      this._httpClient.post(this.baseURL, {username: username, newpassword: newpassword}).subscribe((response) => {
        if(response == 'ok'){
          this._loginService.login({username: username, password: newpassword}).subscribe((authuser) => {
            this._router.navigateByUrl('/')
          })
        }
      })
    }
  }
}
