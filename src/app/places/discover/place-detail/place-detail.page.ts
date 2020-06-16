import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ActionSheetController, AlertController, LoadingController, ModalController, NavController} from '@ionic/angular';
import {PlacesService} from '../../places.service';
import {Place} from '../../place.model';
import {CreateBookingComponent} from '../../../bookings/create-booking/create-booking.component';
import {Subscription} from 'rxjs';
import {BookingService} from '../../../bookings/booking.service';
import {AuthService} from '../../../auth/auth.service';
import {MapModalComponent} from '../../../shared/map-modal/map-modal.component';
import {switchMap, take} from 'rxjs/operators';
import {MyUser} from '../../../auth/myUser.model';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
    myUser: MyUser;
    isBookable = false;
    isLoading = false;
    private userSub: Subscription;

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
  ) { }

  ngOnInit() {
      this.route.paramMap.subscribe(paramMap => {
          if (!paramMap.has('userId')) {
              this.navCtrl.navigateBack('/places/tabs/discover');
              return;
          }
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
                      return this.authService.getUser(paramMap.get('userId'));
                  })
              ).subscribe(user => {
                  this.myUser = user;
                  this.isBookable = user.id !== fetchedUserId;
                  this.isLoading = false;
              }, error => {
                  this.alertCtrl.create({
                      header: 'An error occurred!',
                      message: 'Could not load user.',
                      buttons: [{text: 'Okay', handler: () => {
                              this.router.navigate(['/places/tabs/discover']);
                      }}]
                  }).then(alertEl => alertEl.present());
              });
      });
  }

   onBookPlace() {
      this.actionSheetCtrl.create({
          header: 'Choose an Action',
          buttons: [
              {
                  text: 'Select Date',
                  handler: () => {
                      this.openBookingModal('select');
                  }
              },
              {
                  text: 'Random Date',
                  handler: () => {
                      this.openBookingModal('random');
                  }
              },
              {
                  text: 'Cancel',
                  role: 'cancel'
              }
          ]
      }).then(actionSheetEl => {
          actionSheetEl.present();
      });
   }

   openBookingModal(mode: 'select' | 'random') {
      console.log(mode);
      this.modalCtrl
           .create({
               component: CreateBookingComponent,
               componentProps: { selectedUser: this.myUser, selectedMode: mode }
           })
           .then(modalEl => {
               modalEl.present();
               return modalEl.onDidDismiss();
           })
           .then(resultData => {
               if (resultData.role === 'confirm') {
                   this.loadingCtrl
                       .create({message: 'Booking user...'})
                       .then(loadingEl => {
                           loadingEl.present();
                           const data = resultData.data.bookingData;
                           this.bookingService.addBooking(
                               this.myUser.id,
                               this.myUser.firstName.charAt(0).toUpperCase() + this.myUser.firstName.slice(1) + ' ' +
                               this.myUser.lastName.charAt(0).toUpperCase() + this.myUser.lastName.slice(1),
                               this.myUser.imageUrl,
                               data.firstName,
                               data.lastName,
                               data.guestNumber,
                               data.startDate,
                               data.endDate
                           ).subscribe(() => {
                               loadingEl.dismiss();
                           });
                       });
               }
           });
   }

    ngOnDestroy() {
      if (this.userSub) {
          this.userSub.unsubscribe();
      }
    }
}
