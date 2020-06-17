import {Component, OnDestroy, OnInit} from '@angular/core';
import {FavoriteService} from './favorite.service';
import {Favorite} from './favorite.model';
import {IonItemSliding, LoadingController} from '@ionic/angular';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
})
export class FavoritesPage implements OnInit, OnDestroy {
  loadedFavorites: Favorite[];
  isLoading = false;
  private favoriteSub: Subscription;

  constructor(private favoriteService: FavoriteService, private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.favoriteSub = this.favoriteService.favorites.subscribe(favorites => {
      this.loadedFavorites = favorites;
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.favoriteService.fetchFavorites().subscribe(() => {
      this.isLoading = false;
    });
  }

  onCancelFavorite(favoriteId: string, slidingEl: IonItemSliding) {
    slidingEl.close();
    this.loadingCtrl.create({ message: 'Canceling...' }).then(loadingEl => {
      loadingEl.present();
      this.favoriteService.cancelFavorite(favoriteId).subscribe(() => {
        loadingEl.dismiss();
      });
    });
  }

  ngOnDestroy() {
    if (this.favoriteSub) {
      this.favoriteSub.unsubscribe();
    }
  }

}
