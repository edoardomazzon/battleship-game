import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {


  constructor(private _router: Router) { }

  ngOnInit(): void { }

  gotoprofile(): void {
    this._router.navigateByUrl('/myprofile')
  }

  logoutUser(): void{
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
    location.reload()
  }


}
