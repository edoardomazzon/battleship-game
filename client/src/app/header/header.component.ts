import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { AuthService} from '../services/auth.service';
import { IsAdminService } from '../services/is-admin.service';
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
  public unreadfriendrequests: number
  public canopenmenus: Boolean
  private current_user: any
  private interval: any

  constructor(private _router: Router, public _authservice: AuthService, private _notificationsService: NotificationsService, private _isadminService: IsAdminService) {

    this.current_user = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))
    this.interval = null
    this.friendsTab = false
    this.profileTab = false
    this.notificationsTab = false
    this.unreadnotifications = 0
    this.unreadfriendrequests = 0
    this.canopenmenus = true

  }

  ngOnInit() {
    // Checking every second if the user is logged before starting to listen to notifications sent to him
    this.interval = setInterval(() => {
      this.current_user = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))
      if(this.current_user != null && this.current_user != undefined){
        this.countUnreadNotifications()
        clearInterval(this.interval)
      }
    }, 1000)
  }

  countUnreadNotifications(){
    console.log('counting')
    this._notificationsService.listenToNotifications(this.current_user.username).subscribe((notification) => {
      if(!this.notificationsTab && ( notification.notification_type == 'matchinvite' || notification.notification_type == 'newmessage' || notification.notification_type == 'modmessage')){ this.unreadnotifications += 1 }
      else if(!this.friendsTab && notification.notification_type == 'friendrequest'){ this.unreadfriendrequests += 1 }
      else if(notification.notification_type == 'closeheadermenus'){
        console.log('cant open menus now')
        this.notificationsTab = false
        this.friendsTab = false
        this.profileTab = false
        this.canopenmenus = false
      }
      else if(notification.notification_type == 'openheadermenus'){
        this.canopenmenus = true
      }
    })
  }

  isAdmin(){
    return this._isadminService.isAdmin()
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
    if(this.canopenmenus){
      this.profileTab = !this.profileTab
      this.friendsTab = false
      this.notificationsTab = false
    }
  }
  openFriendsMenu(){
    if(this.canopenmenus){
      this.friendsTab = !this.friendsTab
      this.profileTab = false
      this.notificationsTab = false
      this.unreadfriendrequests = 0
    }

  }
  openNotifications(){
    if(this.canopenmenus){
      this.friendsTab = false
      this.profileTab = false
      this.unreadnotifications = 0
      this.notificationsTab = !this.notificationsTab
    }
  }
}
