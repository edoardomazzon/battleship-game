import { Component, OnInit } from '@angular/core';
import { FriendRequestService } from '../services/friend-request.service';
import { FriendRequest } from '../models/friend-request';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChatmessageService } from '../services/chatmessage.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html'
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
  private usertoken: any;

  constructor(private _friendRequestService: FriendRequestService,
              private _httpClient: HttpClient,
              private _chatMessageService: ChatmessageService) {
    this.usertoken = localStorage.getItem('auth_token')
    this.friendsSection1 = false
    this.friendsSection2 = false
    var user = localStorage.getItem('current_user')
    if(user != null){
      this.current_user = JSON.parse(JSON.parse(JSON.stringify(user)))
      this.getUserInfo()
    }
  }

  ngOnInit() {
    // Immediately load the client with updated user info from db
    this.getUserInfo()

    this._friendRequestService.listenToRequests(this.current_user.username).subscribe((message)=>{
      if(message.request_type == 'friendrequest'){
        // If we received a friendrequest from a user who's in our blacklist, nothing happenes and this "if" branch is not entered
        if(!this.blacklisted_users.includes(message.sender) && !this.friends.includes(message.sender)){
          this.friend_requests_list.push(message.sender)
        }
      }

      // A 'yougotaccepted'+current_username emit is sent from the server when our friend request to some other user gets accepted, so the service
      // catches it and notifies the component through the message.
      else if(message.request_type == 'yougotaccepted'){
        this.friends.push(message.accepting_user)
      }

      // A 'yougotdeleted'+current_username emit is sent from the server when someone deleted us from his friends list. Now we need to update both
      // our localstorage and our component's "friends" field
      else if(message.request_type == 'yougotdeleted'){
        const index = this.friends.indexOf(message.deleter)
        for(let i = index; i < this.friends.length; i++){
          if(this.friends[i+1]){
            this.friends[i] = this.friends[i+1]
          }
        }
        this.friends.length = this.friends.length -1
      }
    })

    this.openFriendSection2()
  }

  private create_options() {
    return {
        headers: new HttpHeaders({
            authorization: 'Bearer ' + this.usertoken,
            'cache-control': 'no-cache',
            'Content-Type': 'application/json',
      })
    };
  }

  //Function used to update the browser's localstorage and this component's fields with updated user info from db
  getUserInfo(){
    this._httpClient.get("http://192.168.244.40:3000/myprofile", this.create_options()).subscribe(user => {
      this.friends = new Array<String>()
      this.blacklisted_users = new Array<String>()
      this.friend_requests_list = new Array<String>()
      this.current_user = user
      localStorage.removeItem('current_user')
      localStorage.setItem('current_user', JSON.stringify(user))
      // Updating friends list
      this.friends = new Array()
      for(let i = 0; i < this.current_user.friends_list.length; i++){
        this.friends[i] = this.current_user.friends_list[i]
      }
      this.current_user.friends_list
      // Updating friend requests
      this.friend_requests_list = new Array()
      for(let i = 0; i < this.current_user.pending_friend_requests.length; i++){
        this.friend_requests_list[i] = this.current_user.pending_friend_requests[i]
      }
      // Updating blocked users
      this.blacklisted_users = new Array()
      for(let i = 0; i < this.current_user.blacklisted_users.length; i++){
        this.blacklisted_users[i] = this.current_user.blacklisted_users[i]
      }
    })
  }

  //Function called when a user searches up a username
  searchUsers(searched_name: String) {
    if(searched_name != null && searched_name != '' && searched_name != undefined){
      this.inputname = null // Resetting the text form's content
      this._httpClient.post('http://192.168.244.40:3000/searchusers', {searched_name: searched_name}).subscribe((response: any) => {
          this.foundUsers = response // Getting 5 users with most similar username to the typed one
        })
    }
  }

  // When a user sends a friend request by clicking on the "send friend request" button
  newFriendRequest(receiver: String) {
    if(this.blacklisted_users.includes(receiver)){ this.unblockUser(receiver) } // Unblocking the receiver if it's in our blacklist
    this.foundUsers = new Array()
    var friendrequest = new FriendRequest();
    friendrequest.receiver = receiver
    friendrequest.sender = JSON.parse(JSON.parse(JSON.stringify((localStorage.getItem('current_user'))))).username
    this._friendRequestService.sendFriendRequest(friendrequest)
  }

  // The reject receiver is the one who recieves the negative response to his request (that is to say the one who sent the request in the first place)
  rejectFriendRequest(reject_receiver: String) {
    var rejected_request = new FriendRequest();
    rejected_request.receiver = reject_receiver
    rejected_request.sender = this.current_user.username
    this._friendRequestService.rejectFriendRequest(rejected_request)
    const index = this.friend_requests_list.indexOf(reject_receiver)
    for(let i = index; i < this.friend_requests_list.length; i++){
      if(this.friend_requests_list[i+1]){
        this.friend_requests_list[i] = this.friend_requests_list[i+1]
      }
    }
    this.friend_requests_list.length = this.friend_requests_list.length -1
  }

  // The reject receiver is the one who recieves the positive response to his request (that is to say the one who sent the request in the first place)
  acceptFriendRequest(acceptance_receiver: String) {
    this.rejectFriendRequest(acceptance_receiver)//È controintuitivo ma questa funzione in verità non fa altro che togliere
    // l'accettato dalla pending list dell'accettante, così ci risparmiamo molta più logica front end dopo. In questo modo
    // togliamo subito l'utente accettato dalle pending list dell'accettante, così dovremo preoccuparci solo di aggiornare la friends list dei due

    var accepted_request = new FriendRequest();
    accepted_request.receiver = acceptance_receiver
    accepted_request.sender = this.current_user.username
    this._friendRequestService.acceptFriendRequest(accepted_request)
    this.friends.push(acceptance_receiver)
  }

  blacklistUser(blacklisted_user: String) {
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

    // Then we actually blacklist the user
    var blacklist_request = new FriendRequest();
    blacklist_request.receiver = blacklisted_user
    blacklist_request.sender = this.current_user.username
    this._friendRequestService.blacklistUser(blacklist_request)

    this.blacklisted_users.push(blacklisted_user)
  }

  unblockUser(blocked_user: String) {
    this._friendRequestService.unblockUser(this.current_user.username, blocked_user)
    const index = this.friend_requests_list.indexOf(blocked_user)
    for(let i = index; i < this.blacklisted_users.length; i++){
      if(this.blacklisted_users[i+1]){
        this.blacklisted_users[i] = this.blacklisted_users[i+1]
      }
    }
    this.blacklisted_users.length = this.blacklisted_users.length -1
  }

  removeFriend(removed_user: String) {
    var remove_request = new FriendRequest()
    remove_request.sender = this.current_user.username
    remove_request.receiver = removed_user
    this._friendRequestService.removeFriend(remove_request)

    const index = this.friends.indexOf(removed_user)
    for(let i = index; i < this.friends.length; i++){
      if(this.friends[i+1]){
        this.friends[i] = this.friends[i+1]
      }
    }
    this.friends.length = this.friends.length -1
  }

  // For HTML component
  openFriendSection1(){
    this.friendsSection1 = !this.friendsSection1
    this.friendsSection2 = false
    this.foundUsers = new Array()
  }
  openFriendSection2(){
    this.getUserInfo()
    this.friendsSection2 = !this.friendsSection2
    this.friendsSection1 = false
  }
  openChat(friend: String){
    this.friendsSection1 = false
    this._chatMessageService.startChat({
      message_type: 'openchat',
      current_user: this.current_user.username,
      other_user: friend,
      chat_type: 'private'
    })
  }

  // Invites a friend to play a match
  inviteToPlay(friend: String){
    this._friendRequestService.inviteToPlay(this.current_user.username, friend)
  }
}
