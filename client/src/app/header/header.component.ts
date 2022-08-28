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
  public notificationsTab: Boolean

  constructor(private _router: Router, public _authservice: AuthService) {
    this.friendsTab = false
    this.profileTab = false
    this.notificationsTab = false
  }

  ngOnInit() {
  }
  gotoprofile() {
    this.profileTab = false
    this._router.navigateByUrl('/myprofile')
  }

  gotoHome() {
    this.profileTab = false
    this.friendsTab = false
    this._router.navigateByUrl('/')
  }


  logoutUser(){
    this.profileTab = false
    this.friendsTab = false
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
    this._router.navigateByUrl('/')
    location.reload()
  }

  openProfileMenu(){
    this.profileTab = !this.profileTab
    this.friendsTab = false
    this.notificationsTab = false
  }
  openFriendsMenu(){
    this.friendsTab = !this.friendsTab
    this.profileTab = false
    this.notificationsTab = false
  }
  openNotifications(){
    this.notificationsTab = !this.notificationsTab
    this.friendsTab = false
    this.profileTab = false
  }
}
