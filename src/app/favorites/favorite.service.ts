import {Injectable} from '@angular/core';
import { Favorite} from './favorite.model';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {AuthService} from '../auth/auth.service';
import {delay, map, switchMap, take, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

interface FavoriteData {
    id: string;
    favUserId: string;
    myUserId: string;
}

@Injectable({ providedIn: 'root' })
export class FavoriteService {
    // tslint:disable-next-line:variable-name
    private _favorites = new BehaviorSubject<Favorite[]>([]);

    get favorites() {
        return this._favorites.asObservable();
    }

    constructor(
        private authService: AuthService,
        private http: HttpClient
    ) {}

    addFavorite(favUserId: string)  {
        let generatedId: string;
        let newFavorite: Favorite;
        let fetchedUserId: string;
        return this.authService.userId.pipe(
            take(1),
            switchMap(userId => {
                if (!userId) {
                    throw new Error('No user id found!');
                }
                fetchedUserId = userId;
                return this.authService.token;
            }),
            take(1),
            switchMap(token => {
                newFavorite = new Favorite(
                    Math.random().toString(),
                    favUserId,
                    fetchedUserId,
                );
                return this.http.post<{name: string}>(
                    `https://${environment.projectIdFirebase}.firebaseio.com/favorites.json?auth=${token}`,
                    { ...newFavorite, id: null }
                );
            }),
            switchMap(resData => {
                generatedId = resData.name;
                newFavorite.id = generatedId;
                console.log('newFavorite', newFavorite);
                return this.favorites;
            }),
            take(1),
            tap(favorites => {
                this._favorites.next(favorites.concat(newFavorite));
            })
        ).pipe(take(1),
            switchMap(() => {
                return of(newFavorite);
            }));
    }

    cancelFavorite(favoriteId: string) {
        return this.authService.token.pipe(
            take(1),
            switchMap(token => {
                return this.http
                    .delete(
                        `https://${environment.projectIdFirebase}.firebaseio.com/favorites/${favoriteId}.json?auth=${token}`
                    );
            }),
            switchMap(() => {
                return this.favorites;
            }),
            take(1),
            tap(favorites => {
                this._favorites.next(favorites.filter(b => b.id !== favoriteId));
            })
        );
    }

    fetchFavorites(): Observable<Favorite[]> {
        let fetchedUserId: string;
        return this.authService.userId.pipe(
            take(1),
            switchMap(userId => {
                if (!userId) {
                    throw new Error('User not found!');
                }
                fetchedUserId = userId;
                return this.authService.token;
            }),
            take(1),
            switchMap(token => {
                return this.http.get<{ [key: string]: FavoriteData }>(
                    // tslint:disable-next-line:max-line-length
                    `https://${environment.projectIdFirebase}.firebaseio.com/favorites.json?orderBy="myUserId"&equalTo="${fetchedUserId}"&auth=${token}`
                );
            }),
            map(favoriteData => {
                const favorites = [];
                for (const key in favoriteData) {
                    if (favoriteData.hasOwnProperty(key)) {
                        favorites.push(
                            new Favorite(
                                key,
                                favoriteData[key].favUserId,
                                favoriteData[key].myUserId,
                            )
                        );
                    }
                }
                return favorites;
            }),
            tap(favorites => {
                this._favorites.next(favorites);
            })
        );
    }
}
