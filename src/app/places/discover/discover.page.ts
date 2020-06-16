import {Component, OnDestroy, OnInit} from '@angular/core';
import {PlacesService} from '../places.service';
import {Place} from '../place.model';
import { SegmentChangeEventDetail } from '@ionic/core';
import {Subscription} from 'rxjs';
import {AuthService} from '../../auth/auth.service';
import {take} from 'rxjs/operators';
import {MyUser} from '../../auth/myUser.model';

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

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.usersSub = this.authService.users.subscribe(users => {
      this.loadedUsers = users;
      // this.relevantUsers = this.loadedUsers;
      // this.listedLoadedUsers = this.relevantUsers;
      this.onFilterUpdate('all');
      // console.log('listedLoadedPlaces', this.listedLoadedPlaces);
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.authService.fetchUsers()
        .subscribe(() => {
      this.isLoading = false;
    });
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail> | string) {
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      if ((event instanceof CustomEvent && event.detail.value === 'all') || (event instanceof String && event === 'all')) {
        this.relevantUsers = this.loadedUsers.filter(
            myUser => myUser.id !== userId
        );
        this.listedLoadedUsers = this.relevantUsers;
      } else {
        this.relevantUsers = this.loadedUsers.filter(
            myUser => myUser.id !== userId
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
  }

}
