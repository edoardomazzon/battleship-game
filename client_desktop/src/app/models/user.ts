export class User {
  role!: string;
  email!: string;
  username!: string;
  max_winstreak!: number;
  current_winstreak!: number;
  shots_fired!: number;
  shots_hit!: number;
  accuracy!: number;
  games_played!: number;
  games_won!: number;
  pfp!: string;
  isbanned!: Boolean;
  needspasswordchange!: Boolean;
  pending_friend_requests!: Array<String>;
  friends_list!: Array<String>;
  blacklisted_users!: Array<String>;
}



