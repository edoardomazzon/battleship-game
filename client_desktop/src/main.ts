import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
enableProdMode();
}


platformBrowserDynamic().bootstrapModule(AppModule).catch(err =>
console.log(err));


// PER L'APP MOBILE (attenzione che con questo l'app desktop non va più)
// document.addEventListener('deviceready', () => {
//   platformBrowserDynamic().bootstrapModule(AppModule).catch(err =>
//   console.log(err));
//   }, false);
