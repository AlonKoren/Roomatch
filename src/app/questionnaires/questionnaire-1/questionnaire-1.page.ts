import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup , NgForm, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertController, LoadingController, NavController} from '@ionic/angular';
import {AuthService} from '../../auth/auth.service';
import {switchMap, take} from 'rxjs/operators';

class Question {
  question: string;
  answers: {[key: number]: string};
  constructor(
      question: string,
      answers: {[key: number]: string}) {
    this.question = question;
    this.answers = answers;
  }
}

@Component({
  selector: 'app-questionnaire-1',
  templateUrl: './questionnaire-1.page.html',
  styleUrls: ['./questionnaire-1.page.scss'],
})
export class Questionnaire1Page implements OnInit, OnDestroy {
  form: FormGroup;

  questions: Question[] = [];

  myAnswers: {[key: number]: string} = {};
  myAnsLen = 0;


  userId: string;
  isLoading = false;
  private userSub: Subscription;
  private allowBack: boolean;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService,
              private alertCtrl: AlertController) {}

  ngOnInit() {
    this.isLoading = true;
    this.allowBack = false;
    this.route.queryParams.subscribe(params => {
      if (params && params.allowBack) {
        this.allowBack = params.allowBack;
      }
    });
    this.userSub = this.authService.userId
        .subscribe(userId => {
          this.userId = userId;

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
    this.isLoading = false;
    const defAns: {[key: number]: string} = { 0: 'Not critical', 1: 'To a reasonable extent', 2: 'very much' };

    this.questions.push(
        new Question('How much do you care if your partner agrees to raise an animal in the apartment ?', defAns));
    this.questions.push(
        new Question('How much it will bother you that your partner smokes in the apartment ?', defAns));
    this.questions.push(
        new Question('How much it will bother you that your partner will often host people in the apartment ?', defAns));
    this.questions.push(
        new Question('How much do you care if your partner has the same gender as yours ?', defAns));
    this.questions.push(
        new Question('How important it is for you that your partner maintains order and cleanliness in the apartment ?', defAns));
    this.questions.push(
        new Question('How important it is for you that your partner agrees to joint shopping in the apartment ?', defAns));
    this.questions.push(
        new Question('How important it is for you that your partner keeps kosher in the apartment ?', defAns));
    this.questions.push(
        new Question('How important it is to you that your roommate be a vegetarian ?', defAns));

    this.form = new FormGroup({});
    this.questions.forEach(value => {
      this.form.addControl(value.question,
          new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }));
    });
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  onSubmit() {

    // TODO send object value to algo then go to discover
    const value = {userid: this.userId, myAnswers: this.myAnswers};
    console.log(value);

    this.isLoading = false;
    this.router.navigateByUrl('/places/tabs/discover');
  }

  radioGroupChange(question: string, answer: string) {
    console.log('question', question);
    console.log('answer', answer);
    this.myAnswers[question] = answer;
    console.log(this.myAnswers);
    this.myAnsLen = Object.keys(this.myAnswers).length;
  }
}
