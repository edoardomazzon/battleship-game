import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  constructor(private _httpClient: HttpClient,
              private _profileService: ProfileService,
              private _friendRequestService: FriendRequestService) { }

  ngOnInit(): void {
    //Prendiamo il json in localStorage che contiene i dati dell'utente loggato
    this.current_user = localStorage.getItem('current_user')
    if (this.current_user != null){ //Se l'utente è stato trovato perché è loggato

      this.getUserInfo((JSON.parse(this.current_user)).username)//Aggiorniamo il localstorage con le nuove info dell'utente dal db

      this._friendRequestService.listenToAnsweredRequests(((JSON.parse(this.current_user)).username)).subscribe((observer)=>{
        if(observer.request_type == 'friendrequest'){
          var current = localStorage.getItem('current_user') //Magari conviene unire questa request_type a quella sotto di reject così risparmiamo codice
          if(current != null){
            this.friend_requests_list = (JSON.parse(JSON.parse(JSON.stringify(current)))).pending_friend_requests
          }
        }
        if(observer.request_type == 'reject'){
          var current = localStorage.getItem('current_user')
          if(current != null){
            this.friend_requests_list = (JSON.parse(JSON.parse(JSON.stringify(current)))).pending_friend_requests
          }
        }
        else if(observer.request_type == 'block'){
          var current = localStorage.getItem('current_user')
          if(current != null){
            //Qui non aggiorno anche la pending requests list perché ci ha già pensato la rejectFriendRequest() chiamata subito dalla blacklistUser()
            this.blacklisted_users = (JSON.parse(JSON.parse(JSON.stringify(current)))).blacklisted_users
          }
        }
        else if(observer.request_type = 'accept'){ //Io ho accettato la richiesta
          var current = localStorage.getItem('current_user')
          if(current != null){
            this.friends = new Array<String>()
            var newlist = (JSON.parse(current)).friends_list
            for(let i = 0; i < newlist.length; i++){
              this.friends.push(newlist[i])
            }
          }
        }
        else if(observer.request_type = 'yougotaccepted'){ //Qualcuno ha accettato la mia richiesta
          console.log('L\'utente '+observer.accepting_user+' ha accettato la nostra richiesta di amicizia')
          var current = localStorage.getItem('current_user')
          if(current != null){
            //Qui dovremo aggiornare la nostra nuova lista di amici visto che il destinatario della richiesta ce l'ha accettata
            var newcurrent = (JSON.parse(JSON.parse(JSON.stringify(current))))
            newcurrent.friends.push(observer.accepting_user)
            localStorage.removeItem('current_user')
            localStorage.setItem('current_user', JSON.stringify(newcurrent))

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
}
