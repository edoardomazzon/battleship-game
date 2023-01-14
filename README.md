# Battleship game
A full-stack web application, comprising a REST-style API backend and a SPA Angular frontend to let the users play the game of “Battleship”.

## HOW TO RUN

### FIRST STEP, STARTING SERVER
1. First of all, open new terminal and navigate to server folder with `cd .\server\`
2. Type `npm run compile` which will compile all the TS files into JS files
3. To populate the database with 4 default users run `npm run populate`
4. Finally, run the script that keep the server listening typing `npm run start`

### HOW TO START APP IN LAN:
1.  In the `client_desktop` folder edit `package.json` on the "start" script by pasting your own IP address; the same goes for `src/environment/environment.ts` with the IP_ADDRESS variable (to obtain your IP address, open a new terminal session and run the `ipconfig` command).
2. Now open a new terminal and type `cd .\client_desktop\` , then type `npm start` which runs the custom script we have created on the specified IP address.

### HOW TO START APP MOBILE:
1. If you changed anything in the client_desktop folder, repeat the changes on `client_mobile` too.
2. In the `client_mobile` folder edit `package.json` on the "start" script by pasting your own IP address; the same goes for `src/environment/environment.ts` with the IP_ADDRESS variable (to obtain your IP address, open a new terminal session and run the `ipconfig` command).
3. Open a new terminal session and type `cd .\client_mobile\` then `npm run build`.
4. Now, in the `mobile` folder we have all the files ready to run the mobile application. Navigate to the "mobile" folder (`cd..` if you are in the previous directory and, in every case, `cd .\mobile\`). 
5. Last step, type `cordova run android` which will start the emulator automatically.
