export class User {
  role!: string;
  email!: string;
  password!: string;
  username!: string;
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



