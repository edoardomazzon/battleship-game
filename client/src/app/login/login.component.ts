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
  constructor(private _loginService: LoginService,
              private _router: Router) {
                this.yourebanned = false
               }

  ngOnInit(): void {
  }
  //Questa function chiama login() di login.service.ts passandogli il nuovo User di angular creato dalla form
  loginUser(): void {
    this._loginService.login(this.authuser).subscribe(authuser =>{ //serve la .subscribe() per eseguire la chiamata http
      if (authuser == 'banned'){ //se siamo loggati correttamente allora reindirizziamo alla myprofile
        this.yourebanned = true
        console.log(authuser)
      }
      else{
        this.yourebanned = false
        this._router.navigateByUrl('/')
      }
    });
  }
}
