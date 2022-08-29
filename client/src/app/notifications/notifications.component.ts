import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationsService } from '../services/notifications.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  private baseURL = 'http://localhost:3000/'
  private current_user: any
  public notifications: any

  constructor(private _httpClient: HttpClient, private _notificationsService: NotificationsService) {
    this.current_user = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))
    this.notifications = new Array()
  }

  ngOnInit(): void {
    this.listenToNotifications()
    this.retrieveNotifications()
  }

  // Waiting for new notifications;
  listenToNotifications(){
    this._notificationsService.listenToNotifications(this.current_user.username).subscribe((notification) => {
      // If we accepted a friend's invite to play, but that friend is no longer available, we add a notification to the list
      // saying that he's no longer available, which is going to be deleted automatically after 3 seconds
      if(notification.notification_type == 'friendnotavailable'){
        this.notifications.push({notification_type: 'friendnotavailable', from: notification.from, tobedeleted: true})
        setTimeout(() => {
          for(let i = 0; i < this.notifications.length; i++){
            if(this.notifications[i] && this.notifications[i].tobedeleted){
              delete(this.notifications[i])
            }
          }
        }, 3000)
      }
      // Whatever the notification type is, we add it in the notifications list. On the html side
      // we will go through each notification type with functions and buttons based on that.
      else{
      this.notifications.push(notification)
      this.orderLastFirst()
      }

    })
  }

  // Retrieves from db all the notifications regarding this user
  retrieveNotifications(){
    this._httpClient.post(this.baseURL+'retrievenotifications', {username: this.current_user.username}).subscribe((response: any) => {
      this.notifications = new Array()
      for(let i = 0; i < response.length; i++){
        this.notifications.push(response[i])
      }
    })
  }

  // Marks a selected notification as read (means that the notification is deleted from the database)
  markNotificationAsRead(notification: any){
    for(let i = 0; i < this.notifications.length; i++){
      if(this.notifications[i].user == notification.user
        && this.notifications[i].from == notification.from
        && this.notifications[i].notification_type == notification.notification_type){
        delete(this.notifications[i])
      }
    }
    this._httpClient.post(this.baseURL+'deletenotification', {notification: notification}).subscribe()
  }

  // Accepts a match; notifies the matchmaking service (which is meanwhile running in the home component) that a match is being created
  acceptMatch(inviter: String){
    this._notificationsService.acceptMatch({
      accepted_user: inviter,
      accepting_user: this.current_user.username,
      message_type: 'matchinviteaccepted'})
  }

  // If the user refuses to play with a friend, all the "matchinvite" notifications coming from that friend are deleted
  rejectMatch(inviter: String){
    for(let i = 0; i < this.notifications.length; i++){
      if(this.notifications[i].from == inviter && this.notifications[i].notification_type == 'matchinvite'){
        delete(this.notifications[i])
      }
    }
  }

  // Sorts notifications by showing the most recent ones first
  orderLastFirst(){
    this.notifications.sort((a: any, b: any) => (a.timestamp.getTime() > b.timestamp.getTime()) ? 1 : -1 )
  }



}