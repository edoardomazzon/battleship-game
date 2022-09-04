import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  private baseURL = 'http://localhost:3000/'
  public users: Array<any>
  public functionalitiessection: Boolean
  public statisticssection: Boolean

  constructor(private _httpClient: HttpClient) {
    this.users = new Array()
    this.statisticssection = false
    this.functionalitiessection = false
  }

  ngOnInit(): void {
    this.getAllUsers()
  }

  /*                                ------------------- ADMIN HOME SECTION ---------------------------                   */


  // Selects all users from the database and orders them in alphabetical order
  getAllUsers(){
    this._httpClient.post(this.baseURL+'admindashboard', {request_type: 'allusers'}).subscribe((response: any) => {
      this.users = new Array()
      for(let i = 0; i < response.length; i++){
        this.users.push(response[i])
      }
      // Orders users in ascending alphabetical order
      this.orderByAlpha('asc')
    })
  }

  // Opens the functionalities section
  openFunctionalitiesSection(){
    this.functionalitiessection = true
    this.statisticssection = false
  }

  // Opens the functionalities section
  openStatisticsSection(){
    this.statisticssection = true
    this.functionalitiessection = false
  }

  // Closes all sections, showing the administrator home page
  backToAdminHome(){
    this.statisticssection = false
    this.functionalitiessection = false
  }


  /*                                ------------------- STATISTICS SECTION ---------------------------                   */

  // Orders users in alphabetical order (ascending or descending depending on the paramenter)
  orderByAlpha(mode: string){
    if(mode == 'asc'){
      this.users.sort((a, b) => a.username.localeCompare(b.username))
    }

    else if(mode == 'desc'){
      this.users.sort((a, b) => a.username.localeCompare(b.username))
      this.users.reverse()
    }
  }

  // Orders users in winrate order (ascending or descending depending on the paramenter)
  orderByWinrate(mode: string){
    this.orderByAlpha('asc')
    for(let user of this.users){
      user.winrate = (user.games_won / user.games_played) * 100
    }
    if(mode == 'asc'){
      this.users.sort((a, b) => (a.winrate > b.winrate) ? 1 : -1 )
    }
    else if(mode == 'desc'){
      this.users.sort((a, b) => (a.winrate < b.winrate) ? 1 : -1 )
    }
  }

  // Orders users by amount of games won (ascending or descending depending on the paramenter)
  orderByGameswon(mode: string){
    this.orderByAlpha('asc')
    if(mode == 'asc'){
      this.users.sort((a, b) => (a.games_won > b.games_won) ? 1 : -1 )
    }
    else if(mode == 'desc'){
      this.users.sort((a, b) => (a.games_won < b.games_won) ? 1 : -1 )
    }
  }

  // Orders users by amount of games lost (ascending or descending depending on the paramenter)
  orderByGameslost(mode: string){
    this.orderByAlpha('asc')
    for(let user of this.users){
      user.games_lost = user.games_played - user.games_won
    }
    if(mode == 'asc'){
      this.users.sort((a, b) => (a.games_lost > b.games_lost) ? 1 : -1 )
    }
    else if(mode == 'desc'){
      this.users.sort((a, b) => (a.games_lost < b.games_lost) ? 1 : -1 )
    }
  }

  // Orders users by amount of games played (ascending or descending depending on the paramenter)
  orderByGamesplayed(mode: string){
    this.orderByAlpha('asc')
    if(mode == 'asc'){
      this.users.sort((a, b) => (a.games_played > b.games_played) ? 1 : -1 )
    }
    else if(mode == 'desc'){
      this.users.sort((a, b) => (a.games_played < b.games_played) ? 1 : -1 )
    }
  }

  // Orders users based on their accuracy (ascending or descending depending on the paramenter)
  orderByAccruacy(mode: string){
    this.orderByAlpha('asc')
    if(mode == 'asc'){
      this.users.sort((a, b) => (a.accuracy > b.accuracy) ? 1 : -1 )
    }
    else if(mode == 'desc'){
      this.users.sort((a, b) => (a.accuracy < b.accuracy) ? 1 : -1 )
    }
  }

  // Orders users based on their longest winstreak (ascending or descending depending on the paramenter)
  orderByLongeststreak(mode: string){
    this.orderByAlpha('asc')
    if(mode == 'asc'){
      this.users.sort((a, b) => (a.max_winstreak > b.max_winstreak) ? 1 : -1 )
    }
    else if(mode == 'desc'){
      this.users.sort((a, b) => (a.max_winstreak < b.max_winstreak) ? 1 : -1 )
    }
  }



  /*                         ------------------- FUCNTIONALITIES SECTION ---------------------------                   */

  // Bans the selected user
  banUser(username: String){
    this._httpClient.post(this.baseURL+'admindashboard', {request_type: 'ban', username: username}).subscribe()
  }

  // Unbans the selected user
  unbanUser(username: String){
    this._httpClient.post(this.baseURL+'admindashboard', {request_type: 'unban', username: username}).subscribe()
  }

  // Promotes the selected user to administrator
  promoteUser(username: String){
    this._httpClient.post(this.baseURL+'admindashboard', {request_type: 'promote', username: username}).subscribe()
  }

  // Wipes the selected user's statistics (winstreaks, accuracy, games played, etc.)
  wipeUser(username: String){
    this._httpClient.post(this.baseURL+'admindashboard', {request_type: 'wipestats', username: username}).subscribe()
  }

  // Activates a popup (or a textbox somewhere in the page) that contains a textbox with the message to be sent to the selected user as a notification
  promptNotificationToUser(username: String){

  }

  // Sends a custom notification to the selected user
  sendNotificationToUser(username: String, message: String){
    this._httpClient.post(this.baseURL+'createnotification', {user: username, from: 'moderators', notification_type: 'modmessage', message: message, timestamp: new Date()}).subscribe()
  }

  // Activates a popup (or a textbox somewhere in the page) that contains a textbox with the message to be sent to the selected user as a notification
  promptNotificationToAllUsers(){

  }

  // Sends a custom notification to all the non-administrator users
  sendNotificationToAllUsers(message: String){
    this._httpClient.post(this.baseURL+'admindashboard', {request_type: 'notifyall', message: message}).subscribe()
  }
}
