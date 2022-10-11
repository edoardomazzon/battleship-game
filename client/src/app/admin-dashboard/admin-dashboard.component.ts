import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  private baseURL = 'http://localhost:3000/'
  public users: Array<any>
  public functionalitiessection: Boolean
  public statisticssection: Boolean
  public current_order: string
  public searched_name: string
  public found_users: Array<any>

  constructor(private _httpClient: HttpClient) {
    this.users = new Array()
    this.statisticssection = false
    this.functionalitiessection = false
    this.current_order = 'asc'
    this.searched_name = ''
    this.found_users = new Array()
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
        response[i].games_lost = response[i].games_played - response[i].games_lost
        response[i].winrate =( response[i].games_won / response[i].games_played) * 100
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
    this.getAllUsers()
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

  // Orders users in alphabetical order (ascending or descending depending on the paramenter).
  // This function is also called everytime we sort the users by a different parameter. For example, if we sort the users by winrate,
  // first we order them by alphabetical order, and then by the actual winrate value. Even if we could have added a secondary sorting condition,
  // the method we chose doesn't affect the complexity since it iterates through the users array twice and executing one comparison instead
  // of iterating once and executing two comparisons.
  orderByAlpha(mode: string){
    if(mode == 'asc'){
      this.users.sort((a, b) => a.username.localeCompare(b.username))
      this.current_order = 'desc'
    }
    else if(mode == 'desc'){
      this.users.sort((a, b) => a.username.localeCompare(b.username))
      this.users.reverse()
      this.current_order = 'asc'
    }
  }

  // Orders users in winrate order (ascending or descending depending on the paramenter)
  orderByWinrate(mode: string){
    this.orderByAlpha('asc') // This doesn't affect the 'asc' or 'desc' order of the function, since it's already been passed as a parameter // This doesn't affect the 'asc' or 'desc' order of the function, since it's already been passed as a parameter
    if(mode == 'asc'){
      this.users.sort((a, b) => (a.winrate > b.winrate) ? 1 : -1 )
      this.current_order = 'desc'
    }
    else if(mode == 'desc'){
      this.users.sort((a, b) => (a.winrate < b.winrate) ? 1 : -1 )
      this.current_order = 'asc'
    }
  }

  // Orders users by amount of games won (ascending or descending depending on the paramenter)
  orderByGameswon(mode: string){
    this.orderByAlpha('asc') // This doesn't affect the 'asc' or 'desc' order of the function, since it's already been passed as a parameter
    if(mode == 'asc'){
      this.users.sort((a, b) => (a.games_won > b.games_won) ? 1 : -1 )
      this.current_order = 'desc'
    }
    else if(mode == 'desc'){
      this.users.sort((a, b) => (a.games_won < b.games_won) ? 1 : -1 )
      this.current_order = 'asc'
    }
  }

  // Orders users by amount of games lost (ascending or descending depending on the paramenter)
  orderByGameslost(mode: string){
    this.orderByAlpha('asc') // This doesn't affect the 'asc' or 'desc' order of the function, since it's already been passed as a parameter
    if(mode == 'asc'){
      this.users.sort((a, b) => (a.games_lost > b.games_lost) ? 1 : -1 )
      this.current_order = 'desc'
    }
    else if(mode == 'desc'){
      this.users.sort((a, b) => (a.games_lost < b.games_lost) ? 1 : -1 )
      this.current_order = 'asc'
    }
  }

  // Orders users by amount of games played (ascending or descending depending on the paramenter)
  orderByGamesplayed(mode: string){
    this.orderByAlpha('asc') // This doesn't affect the 'asc' or 'desc' order of the function, since it's already been passed as a parameter
    if(mode == 'asc'){
      this.users.sort((a, b) => (a.games_played > b.games_played) ? 1 : -1 )
      this.current_order = 'desc'
    }
    else if(mode == 'desc'){
      this.users.sort((a, b) => (a.games_played < b.games_played) ? 1 : -1 )
      this.current_order = 'asc'
    }
  }

  // Orders users based on their accuracy (ascending or descending depending on the paramenter)
  orderByAccuracy(mode: string){
    this.orderByAlpha('asc') // This doesn't affect the 'asc' or 'desc' order of the function, since it's already been passed as a parameter
    if(mode == 'asc'){
      this.users.sort((a, b) => (a.accuracy > b.accuracy) ? 1 : -1 )
      this.current_order = 'desc'
    }
    else if(mode == 'desc'){
      this.users.sort((a, b) => (a.accuracy < b.accuracy) ? 1 : -1 )
      this.current_order = 'asc'
    }
  }

  // Orders users based on their longest winstreak (ascending or descending depending on the paramenter)
  orderByLongestStreak(mode: string){
    this.orderByAlpha('asc') // This doesn't affect the 'asc' or 'desc' order of the function, since it's already been passed as a parameter
    if(mode == 'asc'){
      this.users.sort((a, b) => (a.max_winstreak > b.max_winstreak) ? 1 : -1 )
      this.current_order = 'desc'

    }
    else if(mode == 'desc'){
      this.users.sort((a, b) => (a.max_winstreak < b.max_winstreak) ? 1 : -1 )
      this.current_order = 'asc'
    }
  }



  /*                         ------------------- FUCNTIONALITIES SECTION ---------------------------                   */


  // Returns the 5 users with the most similar name to the one typed by the administrator
  searchUsers(){
    // If the administrator actually typed something, he's returned a list with the most similar usernames
    if(this.searched_name != ''){
      this.users = new Array()
      this._httpClient.post(this.baseURL+'searchusers', {searched_name: this.searched_name}).subscribe((response: any) => {
        for(let i = 0; i < response.length; i++){
          response[i].games_lost = response[i].games_played - response[i].games_lost
          response[i].winrate =( response[i].games_won / response[i].games_played) * 100
          this.users.push(response[i])
        }
      })
      this.searched_name = ''
    }
    // Else if the administrator simply pressed on the lens symble without typing anything, he's returned the whole list of all users
    else{
      this.getAllUsers()
    }

  }

  // Bans the selected user
  banUser(username: String){
    this._httpClient.post(this.baseURL+'admindashboard', {request_type: 'ban', username: username}).subscribe()
    for(let user of this.users){
      if(user.username == username){
        user.isbanned = true
      }
    }
  }
  confirmBan(username: String){
    if(window.confirm('Are you sure you want to ban '+username+'?')){
      this.banUser(username)
    }
  }

  // Unbans the selected user
  unbanUser(username: String){
    this._httpClient.post(this.baseURL+'admindashboard', {request_type: 'unban', username: username}).subscribe()
    for(let user of this.users){
      if(user.username == username){
        user.isbanned = false
      }
    }
  }
  confirmUnban(username: String){
    if(window.confirm('Are you sure you want to unban '+username+'?')){
      this.unbanUser(username)
    }
  }

  // Promotes the selected user to administrator
  promoteUser(username: String){
    this._httpClient.post(this.baseURL+'admindashboard', {request_type: 'promote', username: username}).subscribe()
  }
  confirmPromote(username: String){
    if(window.confirm('Are you sure you want to promote '+username+' to moderator?')){
      this.promoteUser(username)
    }
  }

  // Wipes the selected user's statistics (winstreaks, accuracy, games played, etc.)
  wipeUser(username: String){
    this._httpClient.post(this.baseURL+'admindashboard', {request_type: 'wipestats', username: username}).subscribe()
  }
  confirmWipe(username: String){
    if(window.confirm('Are you sure you want to wipe '+username+'\'s game statistics?')){
      this.wipeUser(username)
    }
  }

  // Activates a popup (or a textbox somewhere in the page) that contains a textbox with the message to be sent to the selected user as a notification
  promptNotificationToUser(username: String){
    // Should make a textbox appear or popup; whatever the administrator types in it, it will be sent to the selected user
    var message = prompt('Enter the message you want to send to ' + username, '');
    if (message != null && message != "") {
      this.sendNotificationToUser(username, message)
    }
  }

  // Sends a custom notification to the selected user
  sendNotificationToUser(username: String, message: String){
    this._httpClient.post(this.baseURL+'createnotification', {user: username, from: 'moderators', notification_type: 'modmessage', text_content: message, timestamp: new Date()}).subscribe()
  }

  // Activates a popup (or a textbox somewhere in the page) that contains a textbox with the message to be sent to the selected user as a notification
  promptNotificationToAllUsers(){
    // Should make a textbox appear or popup; whatever the administrator types in it, it will be sent to all users
    var message = prompt('Enter the message you want to send to everyone');
    if (message != null && message != "") {
      this.sendNotificationToAllUsers(message)
    }
  }

  // Sends a custom notification to all the non-administrator users
  sendNotificationToAllUsers(message: String){
    this._httpClient.post(this.baseURL+'admindashboard', {request_type: 'notifyall', message: message, timestamp: new Date()}).subscribe()
  }
}
