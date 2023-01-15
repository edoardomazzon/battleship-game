# Battleship game
A full-stack web application, comprising a REST-style API backend and a SPA Angular frontend to let the users play the game of “Battleship”.
The application was tested in a Windows 11 environment, so we advise using a Windows system to run it.

## HOW TO RUN

### FIRST STEP, STARTING SERVER
1. Open new terminal and navigate to server folder with `cd .\server\`  and run "npm i" to install all the packages
2. Type `npm run compile` which will compile all the TS files into JS files
3. To populate the database with 4 default users run `npm run populate`; usernames are Gabriele, Edoardo, Filippo with password "pass", admin
    username is Administrator with passowrd "admin"
4. Finally, start the server by typing `npm run start`

### HOW TO START APP IN LAN:
1.  In the `client_desktop` folder edit `package.json` on the "start" script by pasting your own IP address; the same goes for `src/environment/environment.ts` with the IP_ADDRESS variable (to obtain your IP address, open a new terminal session and run the `ipconfig` command).
2. Now open a new terminal and type `cd .\client_desktop\` , run "npm i" to install all the packages, then type `npm start` which runs the custom script we have created on the specified IP address.
3. Open the browser and navigate to 'http://<IPaddress>:4200'

ATTENTION: if you are not in a private network, there might be problems sharing the Node.js server caused by firewall rules.
In that case, just type "localhost" instead of the full IP address and run "ng serve" instead of "npm run start". 

### HOW TO START APP MOBILE:
1. If you changed anything in the client_desktop folder, repeat the changes on `client_mobile` too.
2. In the `client_mobile` folder edit `package.json` on the "start" script by pasting your own IP address; the same goes for `src/environment/environment.ts` with the IP_ADDRESS variable (to obtain your IP address, open a new terminal session and run the `ipconfig` command).
3. Open a new terminal session and type `cd .\client_mobile\`, run "npm i" to install all the packages, then run `npm run build`.
4. Now, in the `mobile` folder we have all the files ready to run the mobile application. Navigate to the "mobile" folder (`cd..` if you are in the previous directory and, in every case, `cd .\mobile\`). 
5. Last step, type `cordova run android` which will start the emulator automatically.

ATTENTION: if you are not in a private network, there might be problems sharing the Node.js server caused by firewall rules.
In that case, just type "localhost" instead of the full IP address and run "ng serve" instead of "npm run start". 


For further information about the system setup please consult "gabriele_cecconello_870751.pdf" or "edoardo_mazzon_870606.pdf".