# Battleship game
A full-stack web application, comprising a REST-style API backend and a SPA Angular frontend to let the users play the game of “Battleship”.

## HOW TO RUN

### FIRST STEP, STARTING SERVER
1. First of all, open new terminal and navigate to server folder with `cd .\server\`
2. Type `npm run compile` which will compile all the TS files into JS files
3. To populate the database with 4 default users run `npm run populate`
4. Finally, run the script that keep the server listening typing `npm run start`

### HOW TO START APP IN LAN:
1. In the `client_desktop` folder edit `package.json` on script start and `src/environment/environment.ts` the IP_ADDRESS variable with your IP address (to see what is open the terminal and type `ipconfig`).
2. Now open new terminal and type `cd .\client_desktop\` , then type `npm start` that run the custom script we have created (`ng serve --host <ip_address>`).
The `--host <ip_address>` is the script that share with in LAN the client Angular and that's the code we have just wrote.

### HOW TO START APP MOBILE:
1. If you changed anything in the client_desktop, report them too on `client_mobile`.
2. In the `client_mobile` folder edit `package.json` on script start and `src/environment/environment.ts` the IP_ADDRESS variable with your IP address (to see what is open the terminal and type `ipconfig`).
3. Open new terminal and type `cd .\client_mobile\` then `npm run build`.
4. Now, in the `mobile` folder we have all the files ready to run the mobile application. So, open new terminal or use the same and navigate to mobile folder (`cd..` if you are in the previous directory and, in every case, `cd .\mobile\`). 
5. Last step, type `cordova android` which will start the emulator automatically.
