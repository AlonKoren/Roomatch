import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ActionSheetController, AlertController, LoadingController, ModalController, NavController} from '@ionic/angular';
import {of, Subscription} from 'rxjs';
import {FavoriteService} from '../../../favorites/favorite.service';
import {AuthService} from '../../../auth/auth.service';
import {switchMap, take} from 'rxjs/operators';
import {MyUser} from '../../../auth/myUser.model';
import {Favorite} from '../../../favorites/favorite.model';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
    hisUser: MyUser;
    isFavorite = false;
    isLoading = false;
    private userSub: Subscription;
    private favorite: Favorite;

  constructor(
      private route: ActivatedRoute,
      private navCtrl: NavController,
      private modalCtrl: ModalController,
      private actionSheetCtrl: ActionSheetController,
      private favoriteService: FavoriteService,
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
                      console.log('userId', userId);
                      if (!userId) {
                          throw new Error('Found no user!');
                      }
                      fetchedUserId = userId;
                      return this.authService.getUser(paramMap.get('userId')).pipe(
                          take(1),
                          switchMap(value => {
                              return of({hisUser : value , myuserId: userId});
                          }));
                  })
              )
              .pipe(
                  take(1),
                  switchMap(value => {
                      console.log('value', value);
                      return this.favoriteService.fetchFavorites().pipe(
                          take(1),
                          switchMap(favorites => {
                              console.log('favorites', favorites);
                              // tslint:disable-next-line:max-line-length
                              const fav = favorites.find((favorite) => favorite.myUserId === value.myuserId && favorite.favUserId === value.hisUser.id);
                              return of({hisUser : value.hisUser , myUserId: value.hisUser , fav});
                          }));
                  })
              ).subscribe(value =>  {
                  this.hisUser = value.hisUser;
                  this.isFavorite = value.fav !== undefined;
                  this.favorite = value.fav;
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

   // onFavorite() {
   //    this.actionSheetCtrl.create({
   //        header: 'Choose an Action',
   //        buttons: [
   //            {
   //                text: 'Select Date',
   //                handler: () => {
   //                    this.openBookingModal('select');
   //                }
   //            },
   //            {
   //                text: 'Random Date',
   //                handler: () => {
   //                    this.openBookingModal('random');
   //                }
   //            },
   //            {
   //                text: 'Cancel',
   //                role: 'cancel'
   //            }
   //        ]
   //    }).then(actionSheetEl => {
   //        actionSheetEl.present();
   //    });
   // }

    onFavorite() {

       this.loadingCtrl
           .create({message: 'Liking user...'})
           .then(loadingEl => {
               loadingEl.present();
               if (!this.isFavorite) {
                   console.log('addFavorite', this.favorite);
                   this.favoriteService.addFavorite(
                       this.hisUser.id
                   ).subscribe((favorite) => {
                       this.favorite = favorite;
                       console.log('this.favorite', this.favorite);
                       loadingEl.dismiss();
                       this.isFavorite = true;
                       this.navCtrl.navigateBack('/places/tabs/discover');
                   });
               } else {
                   console.log('cancelFavorite', this.favorite);
                   this.favoriteService.cancelFavorite(
                       this.favorite.id
                   ).subscribe(() => {
                       loadingEl.dismiss();
                       this.favorite = undefined;
                       this.isFavorite = false;
                       this.navCtrl.navigateBack('/places/tabs/discover');
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
