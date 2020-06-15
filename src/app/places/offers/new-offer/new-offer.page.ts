import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PlacesService} from '../../places.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertController, LoadingController, NavController} from '@ionic/angular';
import {PlaceLocation} from '../../location.model';
import {switchMap, take} from 'rxjs/operators';
import {Place} from '../../place.model';
import {Observable, of, Subscription} from 'rxjs';
import {AuthService} from '../../../auth/auth.service';
import {MyUser} from '../../../auth/myUser.model';

function dataURLtoBlob(dataurl) {
  const parts = dataurl.split(','), mime = parts[0].match(/:(.*?);/)[1];
  if (parts[0].indexOf('base64') !== -1) {
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], {type: mime});
  } else {
    const raw = decodeURIComponent(parts[1]);
    return new Blob([raw], {type: mime});
  }
}

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit, OnDestroy {
  form: FormGroup;
  ages: number[] = Array(103).fill(0).map((value, index) => index + 18);

  myUser: MyUser;
  userId: string;
  isLoading = false;
  private userSub: Subscription;

  constructor(
      private route: ActivatedRoute,
      private navCtrl: NavController,
      private router: Router,
      private authService: AuthService,
      private loadindCtrl: LoadingController,
      private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.userSub = this.authService.userId
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
      this.form = new FormGroup({
        firstName: new FormControl(this.myUser.firstName, {
          updateOn: 'blur',
          validators: [Validators.required]
        }),
        lastName: new FormControl(this.myUser.lastName, {
          updateOn: 'blur',
          validators: [Validators.required]
        }),
        phone: new FormControl(this.myUser.phone, {
          updateOn: 'blur',
          validators: [Validators.required]
        }),
        age: new FormControl(this.myUser.age, {
          updateOn: 'blur',
          validators: [Validators.required]
        }),
        budget: new FormControl(this.myUser.budget, {
          updateOn: 'blur',
          validators: [Validators.required]
        }),
        area: new FormControl(this.myUser.area, {
          updateOn: 'blur',
          validators: [Validators.required]
        }),
        MoreDetails: new FormControl(this.myUser.MoreDetails, {
          updateOn: 'blur',
        }),
        image: new FormControl(this.myUser.imageUrl, {
          updateOn: 'blur',
          validators: [Validators.required]
        })
      });
      this.isLoading = false;
    }, error => {
      this.alertCtrl.create({
        header: 'An error occurred!',
        message: 'User could not be fetched. Please try again later.',
        buttons: [{text: 'Okay', handler: () => {
            this.router.navigate(['/places/tabs/offers']);
          }}]
      })
          .then(alertEl => {
            alertEl.present();
          });
    });
  }

  onUpdateProfile() {
    if (!this.form.valid) {
      return;
    }
    this.loadindCtrl.create({
      message: 'Updating user...'
    }).then(loadindEl => {
      loadindEl.present();
      let imageObservable: Observable<{imageUrl: string, imagePath: string}>;
      if (this.myUser.imageUrl !== this.form.value.image) {
        imageObservable = this.authService.uploadImage(this.form.value.image);
      } else {
        imageObservable = of({imageUrl: this.myUser.imageUrl, imagePath: null});
      }
      imageObservable.pipe(switchMap(image => {
        return this.authService.updateUser(
            this.myUser.id,
            this.form.value.firstName,
            this.form.value.lastName,
            this.form.value.phone,
            this.form.value.age,
            this.form.value.budget,
            this.form.value.area,
            this.form.value.MoreDetails,
            image.imageUrl);
      })).subscribe(() => {
            loadindEl.dismiss();
            this.form.reset();
            this.router.navigate(['/places/tabs/offers']);
          });
    });
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }



  onImagePicked(imageData: string | File) {

    let imageFile;
    if (typeof imageData === 'string') {
      try {
        imageFile = dataURLtoBlob(imageData);
      } catch (error) {
        console.log(error);
        return;
      }
    } else {
      imageFile = imageData;
    }
    this.form.patchValue({ image: imageFile });
  }

}
