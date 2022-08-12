import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import { FriendRequestService } from '../services/friend-request.service';
import { FriendRequest } from '../models/friend-request';
import { Router } from '@angular/router'
import { HttpClient } from '@angular/common/http';
import { ChatComponent } from '../chat/chat.component';
import { ChatmessageService } from '../services/chatmessage.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit {
  public inputname: any
  public foundUsers: Array<any> = new Array<any>();
  public current_user: any;
  public friend_requests_list: Array<String> = [];
  public blacklisted_users: Array<String> = [];
  public friends: Array<String> = [];
  public friendsSection1: Boolean
  public friendsSection2: Boolean

  constructor(private _profileService: ProfileService,
              private _friendRequestService: FriendRequestService,
              private _httpClient: HttpClient,
              private _chatMessageService: ChatmessageService) {
    // If the user is able to reach this route, it means he already logged in, and the loginservice saves his data in localstorage
    // so we can access it
    var user = localStorage.getItem('current_user')
    if(user != null){
      this.current_user = JSON.parse(JSON.parse(JSON.stringify(user)))
      this.getUserInfo(this.current_user.username)
    }
    this.friendsSection1 = false
    this.friendsSection2 = false
  }

  ngOnInit(): void {
    // Immediately update the browser's localstorage with updated user info from db
    this.getUserInfo(this.current_user.username)
    localStorage.removeItem('response')
    // This function is invoked by the friend-request service, which whill return an observable for Socket.io emits.
    // Once the service listens to an emit from the server, the client's component is notified and is engaged differently
    // depending on the request type notified by the server.
    // The "observer" object returned by this function, which has been hit by a next() call, carries within itself some information:
    // who the request sender is, the request receiver and the request_type (someone accepted us, we accepted somebody's request, we rejected someone's request,
    // etc.
    this._friendRequestService.listenToAnsweredRequests(this.current_user.username).subscribe((observer)=>{

      //If we reject someone's request or if we receive someone's request, we still have to update the component's friend requests list in both cases.
      if(observer.request_type == 'reject' || (observer.request_type == 'friendrequest' && !this.blacklisted_users.includes(observer.sender))){
        // If we received a friendrequest from a user who's in our blacklist, nothing happenes and this "if" branch is not entered
        var current = localStorage.getItem('current_user')
        if(current != null){
          this.friend_requests_list = (JSON.parse(JSON.parse(JSON.stringify(current)))).pending_friend_requests
        }
      }

      //If we blacklisted a user, we have to udpate the component's istances's blacklisted_users list with that new user in it.
      //Notice how we don't update the pending_friend_requests list: that's because the blacklistUser() function immediately invokes the rejectFriendRequest()
      //function, which will update the new pending_friend_requests by itself before reaching this point of the execution.
      else if(observer.request_type == 'block'){
        var current = localStorage.getItem('current_user')
        if(current != null){
          this.blacklisted_users = (JSON.parse(JSON.parse(JSON.stringify(current)))).blacklisted_users
        }
      }

      // When we accept someone's request, we have to update our friends list in the component's istance.
      // As for updating the pending requests list, the acceptFriendRequest() counterintuitively invokes rejectFriendRequest(), since its only
      // function is that of deleting the rejected (in this case accepted) user from the pending requests list. That's beacuse, wether we accept
      // or reject someone's request, we still have to pop that someone's username out of our pending requests list, since the request is not pending anymore.
      else if(observer.request_type == 'accept'){
        this.friends.push(observer.accepted_user)
      }

      // A 'yougotaccepted'+current_username emit is sent from the server when our friend request to some other user gets accepted, so the service
      // catches it and notifies the component through the observer. We then update our friends list and pending friend requests list.
      else if(observer.request_type == 'yougotaccepted'){ //Qualcuno ha accettato la mia richiesta
        this.friends.push(observer.accepting_user)
      }

      // A 'deletedfriend'+current_username emit is sent from the server when we delete another user from our friends list. At this point the localstrage
      // has already been updated with the new friends list, and all we have to do is to update this component's "friends" field
      else if(observer.request_type == 'delete'){
        var current = localStorage.getItem('current_user')
        if(current != null){
          this.friends = new Array<String>()
          var newlist = (JSON.parse(current)).friends_list
          for(let i = 0; i < newlist.length; i++){
            this.friends.push(newlist[i])
          }
        }
      }

      // A 'yougotdeleted'+current_username emit is sent from the server when someone deleted us from his friends list. Now we need to update both
      // our localstorage and our component's "friends" field
      else if(observer.request_type == 'yougotdeleted'){
        var current = localStorage.getItem('current_user')
        if(current != null){
          var newuser = JSON.parse(current)
          var newfriendslist = newuser.friends_list
          var deleter_index = newfriendslist.indexOf(observer.deleter)
          for(let i = deleter_index; i < newfriendslist.length; i++){
              newfriendslist[i] = newfriendslist[i+1]
          }
          newfriendslist.pop()

          newuser.friends_list = newfriendslist
          localStorage.removeItem('current_user')
          localStorage.setItem('current_user', JSON.stringify(newuser))

          this.friends = new Array<String>()
          for(let i = 0; i < newfriendslist.length; i++){
            this.friends.push(newfriendslist[i])
          }
        }
      }
    })
    this.openFriendSection1()
  }

  //Function used to update the browser's localstorage and this component's fields with updated user info from db
  getUserInfo(current_username: String){
    console.log('GET USER INFO')
    this.friends = new Array<String>()
    this.blacklisted_users = new Array<String>()
    this.friend_requests_list = new Array<String>()

    //With this function we query the db for the current user's data and save it in the browser's localstorage
    const user = this._profileService.getUserInfo(current_username)

    //Here we update this component's fields
    var u = localStorage.getItem('current_user')
    if(u!=null){
      this.current_user = JSON.parse(u)
      this.current_user.salt = null
      this.current_user.digest = null
      this.current_user.password = null
      var friendslist = JSON.parse(u).friends_list
      if(friendslist!=null){
        for(let i = 0; i < friendslist.length; i++){
          this.friends[i] = friendslist[i]
        }
      }
      var pending_list = JSON.parse(u).pending_friend_requests
      if(pending_list!=null){
        for(let i = 0; i < pending_list.length; i++){
          this.friend_requests_list[i] = pending_list[i]
        }
      }
      var blacklist = JSON.parse(u).blacklisted_users
      if(blacklist!=null){
        for(let i = 0; i < blacklist.length; i++){
          this.blacklisted_users[i] = blacklist[i]
        }
      }
    }
  }

  //Function called when a user searches up a username
  searchUsers(searched_name: String): void{
    if(searched_name != null && searched_name != '' && searched_name != undefined){
      this.inputname = null // Resetting the text form's content
      this._httpClient.post('http://localhost:3000/searchusers', {searched_name: searched_name}).subscribe((response: any) => {
          this.foundUsers = response // Getting 5 users with most similar username to the typed one
        })
    }
  }

  //Funzione chiamata quando un utente A preme su "Send friend request" di fianco a un utente B
  newFriendRequest(receiver: String): void{
    this.foundUsers = new Array()
    var friendrequest = new FriendRequest();
    friendrequest.receiver = receiver
    friendrequest.sender = JSON.parse(JSON.parse(JSON.stringify((localStorage.getItem('current_user'))))).username
    this._friendRequestService.sendFriendRequest(friendrequest) //Funzione in FriendRequestService
  }

  //Il reject receiver è chi riceve la risposta negativa alla richiesta di amicizia (cioè chi per primo ha inviato la richiesta)
  rejectFriendRequest(reject_receiver: String): void {
    var rejected_request = new FriendRequest();
    rejected_request.receiver = reject_receiver
    rejected_request.sender = JSON.parse(JSON.parse(JSON.stringify((localStorage.getItem('current_user'))))).username
    this._friendRequestService.rejectFriendRequest(rejected_request)
  }

  //L'acceptance receiver è chi riceve la risposta positiva della richiesta di amicizia (cioè chi per primo ha inviato la richiesta)
  acceptFriendRequest(acceptance_receiver: String): void {
    this.rejectFriendRequest(acceptance_receiver)//È controintuitivo ma questa funzione in verità non fa altro che togliere
    // l'accettato dalla pending list dell'accettante, così ci risparmiamo molta più logica front end dopo. In questo modo
    // togliamo subito l'utente accettato dalle pending list dell'accettante, così dovremo preoccuparci solo di aggiornare la friends list dei due

    var accepted_request = new FriendRequest();
    accepted_request.receiver = acceptance_receiver
    accepted_request.sender = JSON.parse(JSON.parse(JSON.stringify((localStorage.getItem('current_user'))))).username
    this._friendRequestService.acceptFriendRequest(accepted_request)
  }

  blacklistUser(blacklisted_user: String): void {
    this.foundUsers = new Array()
    /* Here we have two situations:
        1. the user we want to blacklist is in our friend requests list --> we first have to delete him from the pending list and
           then add him to our blacklisted_users list, otherwise it will cause a server error since mongoose won't find said username
           in the receiver's pending_fiend_requests
        2. we searched up his username and then clicked on "block user"; that means he's not in our friend requests list --> we don't
           have to remove him from the pending friend requests. */
    if (this.friend_requests_list.includes(blacklisted_user)){
      this.rejectFriendRequest(blacklisted_user)
    }

    //Poi blacklistiamo l'utente che ha effettuato la richiesta
    var blacklist_request = new FriendRequest();
    blacklist_request.receiver = blacklisted_user
    blacklist_request.sender = JSON.parse(JSON.parse(JSON.stringify((localStorage.getItem('current_user'))))).username
    this._friendRequestService.blacklistUser(blacklist_request)
  }

  removeFriend(removed_user: String){
    var remove_request = new FriendRequest()
    remove_request.sender = this.current_user.username
    remove_request.receiver = removed_user
    this._friendRequestService.removeFriend(remove_request)
  }

  openFriendSection1(){
    this.friendsSection1 = !this.friendsSection1
    this.friendsSection2 = false
  }
  openFriendSection2(){
    this.friendsSection2 = !this.friendsSection2
    this.friendsSection1 = false
  }
  openChat(friend: String){
    this.friendsSection1 = false
    console.log('Starting chat between '+this.current_user.username+' and '+ friend)
    this._chatMessageService.startChat({
      current_user: this.current_user.username,
      other_user: friend
    })
  }
}
