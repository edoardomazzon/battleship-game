import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { AuthService} from '../services/auth.service';
import { NotificationsService } from '../services/notifications.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public profileTab: Boolean
  public friendsTab: Boolean
  public notificationsTab: Boolean
  public unreadnotifications: number
  private current_user: any

  constructor(private _router: Router, public _authservice: AuthService, private _notificationsService: NotificationsService) {
    this.current_user = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))
    this.friendsTab = false
    this.profileTab = false
    this.notificationsTab = false
    this.unreadnotifications = 0
  }

  ngOnInit() {
    this.countUnreadNotifications()
  }

  countUnreadNotifications(){
    this._notificationsService.listenToNotifications(this.current_user.username).subscribe((notification) => {
      if(!this.notificationsTab){ this.unreadnotifications += 1 }
    })
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
    this.friendsTab = false
    this.profileTab = false
    this.unreadnotifications = 0
    this.notificationsTab = !this.notificationsTab
  }
}
