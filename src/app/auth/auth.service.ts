import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {BehaviorSubject, from, of} from 'rxjs';
import {User} from './user.model';
import {map, switchMap, take, tap} from 'rxjs/operators';
import { Plugins } from '@capacitor/core';
import {Place} from '../places/place.model';
import {PlaceLocation} from '../places/location.model';
import {MyUser} from './myUser.model';

export interface AuthResponseData {
  kind:	string;
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
  expiresIn: string;
  registered?: boolean;
}

interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    age: number;
    budget: number;
    area: string;
    MoreDetails: string;
    imageUrl: string;
    userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  // tslint:disable-next-line:variable-name
  private _user = new BehaviorSubject<User>(null);
  private activeLogoutTimer: any;
    // tslint:disable-next-line:variable-name
  private _users = new BehaviorSubject<MyUser[]>([]);

  get userIsAuthenticated() {
    return this._user.asObservable().pipe(
        map(user => {
          if (user) {
            return !!user.token;
          } else {
            return false;
          }
        })
    );
  }

  get userId() {
    return this._user.asObservable().pipe(
        map(user => {
          if (user) {
            return user.id;
          } else {
            return null;
          }
        })
    );
  }

  get token() {
      return this._user.asObservable().pipe(
          map(user => {
              if (user) {
                  return user.token;
              } else {
                  return null;
              }
          })
      );
  }

  constructor(
      private http: HttpClient
  ) {}

  autoLogin() {
      return from(Plugins.Storage.get({ key: 'authData' })).pipe(
          map(storedData => {
              if (!storedData || !storedData.value) {
                  return null;
              }
              const parsedData = JSON.parse(storedData.value) as {
                  token: string;
                  tokenExpirationDate: string;
                  userId: string;
                  email: string;
              };
              const expirationTime = new Date(parsedData.tokenExpirationDate);
              if (expirationTime <= new Date()) {
                  return null;
              }
              const user = new User(
                  parsedData.userId,
                  parsedData.email,
                  parsedData.token,
                  expirationTime
              );
              return user;
          }),
          tap(user => {
              if (user) {
                  this._user.next(user);
                  this.autoLogout(user.tokenDuration);
              }
          }),
          map(user => {
              return !!user;
          })
      );
  }

  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${
            environment.firebaseAPIKey
        }`,
        {email, password, returnSecureToken: true}
        ).pipe(tap(this.setUserData.bind(this)));
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${
            environment.firebaseAPIKey
        }`,
        { email, password, returnSecureToken: true }
        ).pipe(tap(this.setUserData.bind(this)));
  }

  logout() {
      if (this.activeLogoutTimer) {
          clearTimeout(this.activeLogoutTimer);
      }
      this._user.next(null);
      Plugins.Storage.remove({ key: 'authData' });
  }

  ngOnDestroy() {
      if (this.activeLogoutTimer) {
          clearTimeout(this.activeLogoutTimer);
      }
  }

    private autoLogout(duration: number) {
      if (this.activeLogoutTimer) {
          clearTimeout(this.activeLogoutTimer);
      }
      this.activeLogoutTimer = setTimeout(() => {
          this.logout();
      }, duration);
  }

  private setUserData(userData: AuthResponseData) {
      const expirationTime = new Date(
          new Date().getTime() + +userData.expiresIn * 1000
      );
      const user = new User(
          userData.localId,
          userData.email,
          userData.idToken,
          expirationTime
      );
      this._user.next(user);
      this.autoLogout(user.tokenDuration);
      this.storeAuthData(
          userData.localId,
          userData.idToken,
          expirationTime.toISOString(),
          userData.email
      );
  }

  private storeAuthData(userId: string, token: string, tokenExpirationDate: string, email: string) {
      const data = JSON.stringify({
          userId,
          token,
          tokenExpirationDate,
          email
      });
      Plugins.Storage.set({ key: 'authData', value: data });
  }



  /// AUTH DATABASE INFORMATION



    get users() {
        return this._users.asObservable();
    }

    fetchUsers() {
        return this.token.pipe(
            take(1),
            switchMap(token => {
                return this.http
                    .get<{[key: string]: UserData }>(
                        `https://${environment.projectIdFirebase}.firebaseio.com/users.json?auth=${token}`
                    );
            }),
            map(resData => {
                const users = [];
                for (const key in resData) {
                    if (resData.hasOwnProperty(key)) {
                        users.push(
                            new MyUser(
                                key,
                                resData[key].firstName,
                                resData[key].lastName,
                                resData[key].email,
                                resData[key].phone,
                                resData[key].age,
                                resData[key].budget,
                                resData[key].area,
                                resData[key].MoreDetails,
                                resData[key].imageUrl,
                            )
                        );
                    }
                }
                return users;
            }),
            tap(users => {
                this._users.next(users);
            })
        );
    }

    getUser(id: string) {
        return this.token.pipe(
            take(1),
            switchMap(token => {
                return this.http
                    .get<UserData>(
                        `https://${environment.projectIdFirebase}.firebaseio.com/users/${id}.json?auth=${token}`
                    );
            }),
            map(userData => {
                return new MyUser(
                    id,
                    userData.firstName,
                    userData.lastName,
                    userData.email,
                    userData.phone,
                    userData.age,
                    userData.budget,
                    userData.area,
                    userData.MoreDetails,
                    userData.imageUrl,
                );
            })
        );
    }

    uploadImage(image: File) {
        const uploadData = new FormData();
        uploadData.append('image', image);

        return this.token.pipe(
            take(1),
            switchMap(token => {
                console.log('token', token);
                return this.http.post<{imageUrl: string, imagePath: string}>(
                    'https://' + environment.serverLocation + '-' + environment.projectIdFirebase + '.cloudfunctions.net/storeImage',
                    uploadData,
                    { headers: { Authorization: 'Bearer ' + token } }
                );
            })
        );
    }

    addUser(firstName: string, lastName: string, email: string, phone: string,
            age: number, budget: number, area: string, MoreDetails: string, imageUrl: string) {
        let generatedId: string;
        let fetchedUserId: string;
        let newUser: MyUser;
        return this.userId.pipe(
            take(1),
            switchMap(userId => {
                console.log('addUser', userId);
                fetchedUserId = userId;
                return this.token;
            }),
            take(1),
            switchMap(token => {
                if (!fetchedUserId) {
                    console.log('addUser', 'No user found!');
                    throw new Error('No user found!');
                }
                newUser = new MyUser(
                    fetchedUserId,
                    firstName,
                    lastName,
                    email,
                    phone,
                    age,
                    budget,
                    area,
                    MoreDetails,
                    imageUrl,
                );
                console.log('addUser', newUser);
                return this.http.patch<{ name: string }>(`https://${environment.projectIdFirebase}.firebaseio.com/users/${fetchedUserId}.json?auth=${token}`,
                    {
                        ...newUser,
                        id: fetchedUserId
                    });
            }),
            switchMap(resData => {
                console.log('addUser', resData);
                generatedId = resData.name;
                return this.users;
            }),
            take(1),
            tap(users => {
                console.log('addUser', users);
                newUser.id = generatedId;
                this._users.next(users.concat(newUser));
            })
        );
    }

    updateUser(userId: string, firstName: string, lastName: string, phone: string,
               age: number, budget: number, area: string, MoreDetails: string, imageUrl: string) {
        let updatedUsers: MyUser[];
        let fetchedToken: string;
        return this.token.pipe(
            take(1),
            switchMap(token => {
                fetchedToken = token;
                return this.users;
            }),
            take(1),
            switchMap(users => {
                if (!users || users.length <= 0) {
                    return this.fetchUsers();
                } else {
                    return of(users);
                }
            }),
            switchMap(users => {
                const updatedUserIndex = users.findIndex(usr => usr.id === userId);
                updatedUsers = [...users];
                const oldUser = updatedUsers[updatedUserIndex];
                updatedUsers[updatedUserIndex] = new MyUser(
                    oldUser.id,
                    firstName,
                    lastName,
                    oldUser.email,
                    phone,
                    age,
                    budget,
                    area,
                    MoreDetails,
                    imageUrl,
                );
                return this.http.put(
                    `https://${environment.projectIdFirebase}.firebaseio.com/offered-places/${userId}.json?auth=${fetchedToken}`,
                    { ...updatedUsers[updatedUserIndex], id: null }
                );
            }),
            tap(() => {
                this._users.next(updatedUsers);
            })
        );
    }

}
