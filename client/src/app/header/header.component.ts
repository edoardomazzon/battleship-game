import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { AuthService} from '../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public profileTab: Boolean
  public friendsTab: Boolean

  constructor(private _router: Router, public _authservice: AuthService) {
    this.friendsTab = false
    this.profileTab = false
  }

  ngOnInit() {
  }
  gotoprofile() {
    this.profileTab = false
    this._router.navigateByUrl('/myprofile')
  }

  logoutUser(){
    this.profileTab = false
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
    this._router.navigateByUrl('/')
    location.reload()
  }

  openProfileMenu(){
    this.profileTab = !this.profileTab
    this.friendsTab = false
  }
  openFriendsMenu(){
    this.friendsTab = !this.friendsTab
    this.profileTab = false
  }
}
