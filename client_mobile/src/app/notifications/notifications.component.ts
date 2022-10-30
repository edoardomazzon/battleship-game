import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationsService } from '../services/notifications.service';
import { ChatmessageService } from '../services/chatmessage.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent implements OnInit {
  private baseURL = 'http://10.0.2.2:3000/'
  private current_user: any
  public notifications: any

  constructor(private _httpClient: HttpClient, private _notificationsService: NotificationsService, private _chatmessageService: ChatmessageService) {
    this.current_user = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('current_user'))))
    this.notifications = new Array()
  }

  ngOnInit(): void {
    this.retrieveNotifications()
    this.listenToNotifications()
  }

  // Waiting for new notifications
  listenToNotifications(){
    this._notificationsService.listenToNotifications(this.current_user.username).subscribe((notification) => {
      // If we accepted a friend's invite to pla but that friend is no longer available, we add a notification
      // (to be deleted automatically after 3 seconds) to the list saying that he's no longer available
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
      // When we receive a match invite
      else if(notification.notification_type == 'matchinvite'){
        var alreadyin = false
        for(let i = 0; i < this.notifications.length; i++){
          if(this.notifications[i].from == notification.from){
            alreadyin = true
          }
        }
        if(!alreadyin){
          this.notifications.push(notification)
        }
        this.orderLastFirst()
      }
      // When we receive an "unread message" notification
      else if(notification.notification_type == 'newmessage'){
        var alreadyin = false
        for(let i = 0; i < this.notifications.length; i++){
          if(this.notifications[i].from == notification.from){
            alreadyin = true
          }
        }
        if(!alreadyin){
          this.notifications.push(notification)
        }
        this.orderLastFirst()

      }
      // When we receive a communication from the moderators
      else if(notification.notification_type == 'modmessage'){
        this.notifications.push(notification)
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

  // In case of a newmessage notification, a player can open the chat
  openChat(friend: String){
    this._chatmessageService.startChat({
      message_type: 'openchat',
      current_user: this.current_user.username,
      other_user: friend,
      chat_type: 'private'
    })
  }

  // Sorts notifications by showing the most recent ones first
  orderLastFirst(){
    this.notifications.sort((a: any, b: any) => (a.timestamp.getTime() > b.timestamp.getTime()) ? 1 : -1 )
  }



}
