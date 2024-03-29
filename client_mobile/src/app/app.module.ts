import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IsAuthenticatedService } from './services/is-authenticated.service';
import { IsNotAuthenticatedService } from './services/is-not-authenticated.service';
import { IsAdminService } from './services/is-admin.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ChatComponent } from './chat/chat.component';
import { GameComponent } from './game/game.component';
import { FriendsComponent } from './friends/friends.component';
import { SpectateComponent } from './spectate/spectate.component';
import { SpectatorchatComponent } from './spectatorchat/spectatorchat.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { UserinfoComponent } from './userinfo/userinfo.component';


const routes: Routes = [
  {path: 'register', component: RegisterComponent, canActivate : [IsNotAuthenticatedService]},
  {path: 'login', component: LoginComponent, canActivate : [IsNotAuthenticatedService]},
  {path: '', component: HomeComponent, canActivate: [IsAuthenticatedService]},
  {path: '**', redirectTo: '/'}
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    MyProfileComponent,
    AdminDashboardComponent,
    HeaderComponent,
    FooterComponent,
    ChatComponent,
    GameComponent,
    FriendsComponent,
    SpectateComponent,
    SpectatorchatComponent,
    NotificationsComponent,
    UserinfoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(routes),
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
