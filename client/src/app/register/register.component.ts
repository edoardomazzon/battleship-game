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

  constructor(private _registerService: RegisterService,
              private _router: Router) { }

  ngOnInit(): void {
  }

  registerUser(): void {
    this._registerService.addUser(this.newuser).subscribe(newuser =>{
      if (newuser){
        this._router.navigateByUrl('/login')
      }
    });
  }
}
