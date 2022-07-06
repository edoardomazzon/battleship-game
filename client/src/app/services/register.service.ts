/*
  Questo è un servizio che va fatto per ogni componente perché è quello che poi manda le request http con i json che il relativo component gli passerà.
  In questo caso in register.component.ts dichiariamo la funzione registerUser() che a sua volta richiama la addUser() qui sotto passandogli un oggetto di tipo User
  (attenzione: questo User è un model di angular, non di MongoDB) sotto forma di json che poi questo servizio invierà alla porta 3000 nella route register, così il server
  prende questo Json, lo parsa e lo passa al costruttore di documenti MongoDB che stavolta usa il SUO model "User" (il fatto che i model User di angular e mongodb si chiamino
  in modo uguale è solo una coincidenza).

  Vedere ./models/user.ts per altre informazioni a riguardo
*/

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private baseURL: string = 'http://localhost:3000/register'

  constructor(private _httpClient: HttpClient) { }

  addUser(user: User) {
    return this._httpClient.post(this.baseURL, user);
  }
}
