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

  constructor(private _httpClient: HttpClient,
              private _profileService: ProfileService,
              private _friendRequestService: FriendRequestService) { }

  ngOnInit(): void {
    //Prendiamo il json in localStorage che contiene i dati dell'utente loggato
    this.current_user = localStorage.getItem('current_user')
    if (this.current_user != null){ //Se l'utente è stato trovato perché è loggato
      this.current_user = JSON.parse(this.current_user)
      this.friend_requests_list = this.current_user.pending_friend_requests
    } else { this.current_user = new User();} //Se l'utente non è stato trovato allora ne creiamo uno vuoto altrimenti avremmo un errore nell'html
  }

  //L'acceptance receiver è chi riceve la risposta positiva della richiesta di amicizia (cioè chi per primo ha inviato la richiesta)
  acceptFriendRequest(acceptance_receiver: String): void {
    var accepted_request = new FriendRequest();
    accepted_request.receiver = acceptance_receiver
    accepted_request.sender = JSON.parse(JSON.parse(JSON.stringify((localStorage.getItem('current_user'))))).username
    this._friendRequestService.acceptFriendRequest(accepted_request)
  }

  //Il reject receiver è chi riceve la risposta negativa alla richiesta di amicizia (cioè chi per primo ha inviato la richiesta)
  rejectFriendRequest(reject_receiver: String): void {
    var rejected_request = new FriendRequest();
    rejected_request.receiver = reject_receiver
    rejected_request.sender = JSON.parse(JSON.parse(JSON.stringify((localStorage.getItem('current_user'))))).username
    this._friendRequestService.rejectFriendRequest(rejected_request)
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
