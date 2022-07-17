import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service'; //Utilizziamo AuthService per avere il metodo isAuthenticated()

/*
Questa classe implementa l'interfaccia CanActivate, quindi implementa il metodo canActivate.
Questo metodo verrà utilizzato in app.modules.ts per determinare se un utente può attivare una certa
route; in questo caso, la route a cui verrà assegnato questo metodo sarà attivabile solo se l'utente
è autenticato.
*/

@Injectable({
  providedIn: 'root'
})

export class IsAuthenticatedService implements CanActivate {

  constructor(public _auth: AuthService,
              public _router: Router) { }

  canActivate(): boolean {
    if (!this._auth.isAuthenticated()) { //Metodo preso da AuthService
      this._router.navigateByUrl('/login') //Se non si è loggati si finisce nella login route
      return false;
    }
    return true;
  }
}
