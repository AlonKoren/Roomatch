import { Component, OnInit } from '@angular/core';
import {AuthResponseData, AuthService} from './auth.service';
import {Router} from '@angular/router';
import {AlertController, LoadingController} from '@ionic/angular';
import {FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';

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
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
    form: FormGroup;
    isLoading = false;
    isLogin = true;
    ages: number[] = Array(103).fill(0).map((value, index) => index + 18);


  constructor(
      private authService: AuthService,
      private router: Router,
      private  loadingCtrl: LoadingController,
      private alertCtrl: AlertController
  ) {}

  ngOnInit() {
      this.form = new FormGroup({
          firstName: new FormControl(null, {
              updateOn: 'blur',
              validators: [Validators.required]
          }),
          lastName: new FormControl(null, {
              updateOn: 'blur',
              validators: [Validators.required]
          }),
          email: new FormControl(null, {
              updateOn: 'blur',
              validators: [Validators.required]
          }),
          password: new FormControl(null, {
              updateOn: 'blur',
              validators: [Validators.required]
          }),
          phone: new FormControl(null, {
              updateOn: 'blur',
              validators: [Validators.required]
          }),
          age: new FormControl(null, {
              updateOn: 'blur',
              validators: [Validators.required, Validators.min(18)]
          }),
          budget: new FormControl(null, {
              updateOn: 'blur',
              validators: [Validators.required, Validators.min(0)]
          }),
          area: new FormControl(null, {
              updateOn: 'blur',
              validators: [Validators.required]
          }),
          MoreDetails: new FormControl(null, {
              updateOn: 'blur'
          }),
          image: new FormControl(null)
      });
  }

  authenticate(user: any) {
    this.isLoading = true;
    const image = this.form.get('image').value;
    this.loadingCtrl.create({ keyboardClose: true, message: 'Logging in...' })
        .then(loadingEl => {
          loadingEl.present();
          // tslint:disable-next-line:prefer-const
          let authObs: Observable<AuthResponseData>;
          if (this.isLogin) {
            authObs = this.authService.login(user.email, user.password);
          } else {
            authObs = this.authService.signup(user.email, user.password)
                .pipe(value => {
                console.log('sign up vi', value);
                console.log('sign up image', image);
                return value;
              });
          }
          authObs.subscribe(resData => {
            console.log(resData);
            if (!this.isLogin) {
                this.authService.uploadImage(image)
                    .pipe(
                        switchMap(uploadRes => {
                                console.log('upload image signup', uploadRes);
                                return this.authService.addUser(
                                    user.firstName,
                                    user.lastName,
                                    user.email,
                                    user.phone,
                                    +user.age,
                                    +user.budget,
                                    user.area,
                                    user.MoreDetails,
                                    uploadRes.imageUrl,
                                );
                            }
                        )).subscribe(() => {
                    this.isLoading = false;
                    loadingEl.dismiss();
                    this.router.navigateByUrl('/questions1', {
                        queryParams: {
                            allowBack: false
                        }
                    }); // TODO navigate to Q&A
                });
            } else {
                this.isLoading = false;
                loadingEl.dismiss();
                this.router.navigateByUrl('/places/tabs/discover');
            }
          }, errRes => {
            loadingEl.dismiss();
            const code = errRes.error.error.message;
            let message = 'Could not sign you up, please try again.';
            if (code === 'EMAIL_EXISTS') {
              message = 'The email address is already in use by another account.';
            } else if (code === 'EMAIL_NOT_FOUND') {
              message = 'E-Mail address could not be found.';
            } else if (code === 'INVALID_PASSWORD') {
              message = 'The password is invalid.';
            }
            this.showAlert(message);
          });
        });
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const firstName = form.value.firstName;
    const lastName = form.value.lastName;
    const email = form.value.email;
    const password = form.value.password;
    const phone = form.value.phone;
    const age = Number(form.value.age);
    const budget = form.value.budget;
    const area = form.value.area;
    const MoreDetails = form.value.MoreDetails;
    // const image = form.value.image;
    const user = {
        firstName,
        lastName,
        email,
        password,
        phone,
        age,
        budget,
        area,
        MoreDetails,
        // image,
    };

    console.log(user);

    this.authenticate(user);
    form.reset();
  }

  private showAlert(message: string) {
    this.alertCtrl
        .create({
          header: 'Authentication failed',
          message,
          buttons: ['Okay']
        })
        .then(alertEl => alertEl.present());
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
