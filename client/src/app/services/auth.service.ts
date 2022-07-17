import { Injectable } from '@angular/core';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';

/*
Questo service ha una funzione utile che ci dice se l'utente è autenticato oppure no
e verrà utilizzata da altri due service: IsAuthenticatedService e IsNotAuthenticatedService.
*/


@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor() { }

  //Se il token esiste e non è scaduto allora siamo autenticati; in tutti gli altri casi non siamo autenticati
  public isAuthenticated(): boolean {
    const jwthelper: JwtHelperService = new JwtHelperService() //Questa classe serve per il metodo .isTokenExpired()
    const token = localStorage.getItem('auth_token');
    if(token){
      return !jwthelper.isTokenExpired(token);
    }
    return false;
  }
}
