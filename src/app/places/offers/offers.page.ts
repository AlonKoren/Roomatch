import {Component, OnDestroy, OnInit} from '@angular/core';
import {PlacesService} from '../places.service';
import {Place} from '../place.model';
import {ActionSheetController, AlertController, IonItemSliding, LoadingController, ModalController, NavController} from '@ionic/angular';
import {ActivatedRoute, Router} from '@angular/router';
import {of, Subscription} from 'rxjs';
import {BookingService} from '../../bookings/booking.service';
import {AuthService} from '../../auth/auth.service';
import {switchMap, take} from 'rxjs/operators';
import {MyUser} from '../../auth/myUser.model';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {
  offers: Place[];
  isLoading = false;
  private placesSub: Subscription;

  myUser: MyUser;
  isBookable = false;

  constructor(
      private route: ActivatedRoute,
      private navCtrl: NavController,
      private modalCtrl: ModalController,
      private actionSheetCtrl: ActionSheetController,
      private bookingService: BookingService,
      private loadingCtrl: LoadingController,
      private authService: AuthService,
      private alertCtrl: AlertController,
      private router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;
    let fetchedUserId: string;
    this.authService.userId
        .pipe(
            take(1),
            switchMap(userId => {
              if (!userId) {
                throw new Error('Found no user!');
              }
              fetchedUserId = userId;
              return this.authService.getUser(userId);
            })
        ).subscribe(myUser => {
      this.myUser = myUser;
      this.isLoading = false;
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.authService.userId
        .pipe(
            take(1),
            switchMap(userId => {
              if (!userId) {
                throw new Error('Found no user!');
              }
              return this.authService.getUser(userId);
            })
        ).subscribe(myUser => {
      this.myUser = myUser;
      this.isLoading = false;
    });
  }



  // onEdit(offerId: string, slidingItem: IonItemSliding) {
  //   slidingItem.close();
  //   this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
  //   console.log('Editing item', offerId);
  // }

    onLogout() {
        this.authService.logout();
    }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}
