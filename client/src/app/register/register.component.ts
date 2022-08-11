import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { RegisterService } from '../services/register.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  public newuser: User = new User()
  public case: any = ''

  constructor(private _registerService: RegisterService,
              private _router: Router) { }

  ngOnInit(): void {
  }

  registerUser(): void {
    this._registerService.addUser(this.newuser).subscribe(newuser =>{
      if (newuser == 'case0' || newuser == 'case1' || newuser == 'case2'){
        this.case = newuser
      }
      else if(newuser){
        this._router.navigateByUrl('/login')
      }
    });
  }
}
