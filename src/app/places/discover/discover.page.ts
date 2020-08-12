import {Component, OnDestroy, OnInit} from '@angular/core';
import { SegmentChangeEventDetail } from '@ionic/core';
import {Subscription} from 'rxjs';
import {AuthService} from '../../auth/auth.service';
import {switchMap, take} from 'rxjs/operators';
import {MyUser} from '../../auth/myUser.model';
import {FavoriteService} from '../../favorites/favorite.service';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  allUsers: MyUser[] = [];
  loadedUsers: MyUser[] = [];
  relevantUsers: MyUser[] = [];
  favArray: string[] = []; // all fav users dynamic
  isLoading = true;
  isLoadingUsers = true;
  private usersSub: Subscription;
  private favoritesSub: Subscription;
  private relativeUserIdsSubs: Subscription;
  mode = 'all';
  listSize = 0;

  constructor(private authService: AuthService,
              private favoriteService: FavoriteService,
              private http: HttpClient) {
  }

  ngOnInit() {
    // console.log('ngOnInit');
    // this.isLoading = true;
    // this.isLoadingUsers = true;
    this.favoritesSub = this.favoriteService.favorites.subscribe(value => {
      this.favArray = value.map(value1 => value1.favUserId);
    //   this.onFilterUpdate(this.mode);
    });

  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.isLoadingUsers = true;
    this.authService.fetchUsers()
        .subscribe(() => {
          this.isLoadingUsers = false;
        });
    this.favoriteService.fetchFavorites()
        .subscribe(() => {

        });

    this.relativeUserIdsSubs = this.authService.userId.pipe(
        take(1),
        switchMap(myUserId => {
          if (!myUserId) {
            throw new Error('User not found!');
          }
          return this.http.get<string[]>(
              `https://algapi.herokuapp.com/getbyid?userId=${myUserId}`
          );
        })
    ).subscribe(relativeUserIds => {
      this.isLoading = true;
      this.usersSub = this.authService.users.subscribe(users => {
        this.allUsers = users; // save all users for favorites
        this.loadedUsers = users.filter((value: MyUser) => {
          return relativeUserIds.includes(value.id);
        });
        this.onFilterUpdate(this.mode);
      });
    });
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail> | string) {
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      if ((event instanceof CustomEvent && event.detail.value === 'all') ||
          (!(event instanceof CustomEvent) && event === 'all')) {
        this.mode = 'all';
        this.relevantUsers = this.loadedUsers.filter(
            myUser => myUser.id !== userId
        );
      } else {
        this.mode = 'favorites';
        this.relevantUsers = this.allUsers.filter(
            myUser => this.favArray.includes(myUser.id)
        );
      }
      this.listSize = this.relevantUsers.length;
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    if (this.usersSub) {
      this.usersSub.unsubscribe();
    }
    if (this.favoritesSub) {
      this.favoritesSub.unsubscribe();
    }
    if (this.relativeUserIdsSubs) {
      this.relativeUserIdsSubs.unsubscribe();
    }
  }

}
