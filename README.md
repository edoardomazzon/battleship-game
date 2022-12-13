### Per far partire l'app 
Fare cd .\client_mobile\  e poi npm run build
In index.js di Mobile, togliere le virgolette interne nello script in <head></head> e nel <base> mettere "./"

### COME FAR PARTIRE L'APP IN LAN:
1. In package.json modificare lo script "start" in modo che includa il proprio indirizzo IP
2. Aprire il terminale e fare "cd .\client_desktop\" e da lì "npm start" che ho fatto in modo che faccia "ng serve --host <indirizzo ip>"
    Questo "--host <indirizzo ip>" è quello che condivide in LAN il client angular ed è quello che abbiamo appena scritto in package.json