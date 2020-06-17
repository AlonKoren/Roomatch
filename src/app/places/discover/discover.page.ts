import {Component, OnDestroy, OnInit} from '@angular/core';
import {PlacesService} from '../places.service';
import {Place} from '../place.model';
import { SegmentChangeEventDetail } from '@ionic/core';
import {Subscription} from 'rxjs';
import {AuthService} from '../../auth/auth.service';
import {take} from 'rxjs/operators';
import {MyUser} from '../../auth/myUser.model';
import {FavoriteService} from '../../favorites/favorite.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedUsers: MyUser[];
  listedLoadedUsers: MyUser[];
  relevantUsers: MyUser[];
  isLoading = false;
  private usersSub: Subscription;
  private favoritesSub: Subscription;
  favArray = []; // all fav users dynamic
  mode = 'all';

  constructor(private authService: AuthService, private favoriteService: FavoriteService) { }

  ngOnInit() {
    this.usersSub = this.authService.users.subscribe(users => {
      this.loadedUsers = users;
      // this.relevantUsers = this.loadedUsers;
      // this.listedLoadedUsers = this.relevantUsers;
      this.onFilterUpdate(this.mode);
      // console.log('listedLoadedPlaces', this.listedLoadedPlaces);
    });
    this.favoritesSub = this.favoriteService.favorites.subscribe(value => {
      this.favArray = value.map(value1 => value1.favUserId);
      this.onFilterUpdate(this.mode);
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.authService.fetchUsers()
        .subscribe(() => {
      this.isLoading = false;
    });
    this.favoriteService.fetchFavorites()
        .subscribe(() => {

        });
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail> | string) {
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      if ((event instanceof CustomEvent && event.detail.value === 'all') || (!(event instanceof CustomEvent) && event === 'all')) {
        this.mode = 'all';
        this.relevantUsers = this.loadedUsers.filter(
            myUser => myUser.id !== userId
        );
        this.listedLoadedUsers = this.relevantUsers;
      } else {
        this.mode = 'favorites';
        this.relevantUsers = this.loadedUsers.filter(
            myUser => this.favArray.includes(myUser.id)
        );
        this.listedLoadedUsers = this.relevantUsers;
      }
      // console.log('listedLoadedPlaces', this.listedLoadedPlaces);
    });
  }

  ngOnDestroy() {
    if (this.usersSub) {
      this.usersSub.unsubscribe();
    }
    if (this.favoritesSub) {
      this.favoritesSub.unsubscribe();
    }
  }

}
