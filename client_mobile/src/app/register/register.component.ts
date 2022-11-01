import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { RegisterService } from '../services/register.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {

  public newuser: User = new User()
  public case: any

  constructor(private _registerService: RegisterService,
              private _router: Router) { }

  ngOnInit(): void {
  }

  goToLogin(){
    this._router.navigateByUrl('/login')
  }

  registerUser(): void {
    this._registerService.addUser(this.newuser).subscribe(response =>{
      if (response == 'case0' || response == 'case1' || response == 'case2'){
        this.case = response
      }
      else if(response){
        this._router.navigateByUrl('/login')
      }
    });
  }
}
