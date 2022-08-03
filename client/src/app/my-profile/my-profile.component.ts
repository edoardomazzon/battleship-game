import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs';
import { ProfileService } from '../services/profile.service';
import { User } from '../models/user';
import { FriendRequestService } from '../services/friend-request.service';
import { FriendRequest } from '../models/friend-request';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
  private baseURL: string = 'http://localhost:3000/myprofile'
  public current_user: any;
  public friend_requests_list: Array<String> = [];
  public blacklisted_users: Array<String> = [];
  public friends: Array<String> = [];

  constructor(private _profileService: ProfileService,
              private _friendRequestService: FriendRequestService) { }

  ngOnInit(): void {
    //Prendiamo il json in localStorage che contiene i dati dell'utente loggato
    this.current_user = localStorage.getItem('current_user')
    if (this.current_user != null){ //Se l'utente è stato trovato perché è loggato

      this.getUserInfo((JSON.parse(this.current_user)).username)//Aggiorniamo il localstorage con le nuove info dell'utente dal db

      // This function is invoked by the friend-request service, which whill return an observable for Socket.io emits.
      // Once the service listens to an emit from the server, the client's component is notified and is engaged differently
      // depending on the request type notified by the server.
      // I.E. the "observer" object returned by this function, which has been hit by a next() call, carries within itself some information:
      // who the request sender is, the request receiver and the request_type (someone accepted us, we accepted somebody's request, we rejected someone's request,
      // etc.
      this._friendRequestService.listenToAnsweredRequests(((JSON.parse(this.current_user)).username)).subscribe((observer)=>{
        
        //If we reject someone's request, or if we receive someone's request, we still have to update the component's istance's friend requests list in both cases.
        if(observer.request_type == 'reject' || observer.request_type = 'friendrequest'){
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
        else if(observer.request_type = 'accept'){ //Io ho accettato la richiesta
          var current = localStorage.getItem('current_user')
          if(current != null){
            var newlist = (JSON.parse(current)).friends_list
            for(let i = 0; i < newlist.length; i++){
              this.friends.push(newlist[i])
            }
          }
        }
        
        // A 'yougotaccepted'+current_username emit is sent from the server when our friend request to some other user gets accepted, so the service
        // catches it and notifies the component through the observer. We then update our friends list and pending friend requests list.
        else if(observer.request_type = 'yougotaccepted'){ //Qualcuno ha accettato la mia richiesta
          console.log('L\'utente '+observer.accepting_user+' ha accettato la nostra richiesta di amicizia')
          var current = localStorage.getItem('current_user')
          if(current != null){
            //Qui dovremo aggiornare la nostra nuova lista di amici visto che il destinatario della richiesta ce l'ha accettata
            var newcurrent = (JSON.parse(JSON.parse(JSON.stringify(current))))
            newcurrent.friends.push(observer.accepting_user)
            localStorage.removeItem('current_user')
            localStorage.setItem('current_user', JSON.stringify(newcurrent))
            //manca l'aggiornamento della pending list di noi che siamo stati accettati
            this.friends = newcurrent.friends
          }
        }
      })

      this.current_user = JSON.parse(this.current_user)
      this.friend_requests_list = this.current_user.pending_friend_requests
    } else { this.current_user = new User();} //Se l'utente non è stato trovato allora ne creiamo uno vuoto altrimenti avremmo un errore nell'html
  }


  getUserInfo(current_username: String){
    const user = this._profileService.getUserInfo(current_username)
    var list = localStorage.getItem('current_user')
    if(list!=null){
      var friendslist = JSON.parse(list).friends_list
      if(friendslist!=null){
        for(let i = 0; i < friendslist.length; i++){
          this.friends[i] = friendslist[i]
        }
      }
      var pending_list = JSON.parse(list).pending_friend
      if(pending_list!=null){
        for(let i = 0; i < pending_list.length; i++){
          this.friend_requests_list[i] = pending_list[i]
        }
      }
    }
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
    //Prima rifiutiamo la richiesta togliendo l'utente dalla pending list
    this.rejectFriendRequest(blacklisted_user)

    //Poi blacklistiamo l'utente che ha effettuato la richiesta
    var blacklist_request = new FriendRequest();
    blacklist_request.receiver = blacklisted_user
    blacklist_request.sender = JSON.parse(JSON.parse(JSON.stringify((localStorage.getItem('current_user'))))).username
    this._friendRequestService.blacklistUser(blacklist_request)
  }
  
