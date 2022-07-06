export class User {
  id!: string;
  email!: string;
  password!: string;
  username!: string;
  max_winstreak!: number;
  current_winstreak!: number;
  accuracy!: number;
  pfp!: string;
}


/*

PRESO ANCHE DA User.js in server/models/user.js



    id: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: false
    },
    max_winstreak: {
        type: Number,
        required: false
    },
    current_winstreak: {
        type: Number,
        required: false
    },
    accuracy: {
        type: Number,
        required: false
    },
    pfp: {
        type: String,
        required: false
    },
*/
