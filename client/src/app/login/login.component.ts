import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserLogin } from '../models/user-login';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  public yourebanned: Boolean
  public authuser: UserLogin = new UserLogin()
  public changing_password: Boolean
  public firstpasswordchangefield: string
  public secondpasswordchangefield: string
  public warnpasswordmismatch: Boolean
  private baseURL = 'http://localhost:3000/login'

  constructor(private _loginService: LoginService, private _router: Router, private _httpClient: HttpClient) {
    this.yourebanned = false
    this.changing_password = false
    this.firstpasswordchangefield = ''
    this.secondpasswordchangefield = ''
    this.warnpasswordmismatch = false
  }

  ngOnInit(){
  }


  loginUser(){
    this._loginService.login(this.authuser).subscribe(authuser =>{
      if (authuser == 'banned'){
        this.yourebanned = true
      }
      else if(authuser.needspasswordchange){
        this.changing_password = true
        console.log('user must change password')
      }
      else{
        this.yourebanned = false
        this._router.navigateByUrl('/')
      }
    });
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
        console.log(response)
        if(response == 'ok'){
          this._loginService.login({username: username, password: newpassword}).subscribe((authuser) => {
            this._router.navigateByUrl('/')
          })
        }
      })
    }
  }
}
