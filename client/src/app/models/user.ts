/*
  Qui creiamo una semplice classe in Angular (che per comodità chiameremo "model di angular") con gli stessi campi del model di mongodb nel server.
  Così con i form possiamo creare dei JSON del tipo:
  {
    "id":"7463209437";
    "email":"prova@email.com";
    eccetera
  }

  i cui campi sono riempiti dal form della componente html.
  Poi questi JSON verranno inviati con POST al server tramite il registerService (vedere ./services/register.service.ts) che con HttpClient invierà le request.
*/

export class User {
  role!: string;
  email!: string;
  password!: string;
  username!: string;
  firstname!: string;
  lastname!: string;
  max_winstreak!: number;
  current_winstreak!: number;
  accuracy!: number;
  games_played!: number;
  games_won!: number;
  pfp!: string;
  pending_friend_requests!: Array<String>;
  friends_list!: Array<String>;
  blacklisted_users!: Array<String>;
}



