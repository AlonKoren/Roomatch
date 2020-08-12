import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup , Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertController} from '@ionic/angular';
import {AuthService} from '../../auth/auth.service';
import {HttpClient} from '@angular/common/http';

class Question {
  question: string;
  answers: {[key: number]: string};
  id: string;
  constructor(
      question: string,
      answers: {[key: number]: string},
      id: string) {
    this.question = question;
    this.answers = answers;
    this.id = id;
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
              private alertCtrl: AlertController,
              private http: HttpClient) {}

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
        new Question('How much do you care if your partner agrees to raise an animal in the apartment ?', defAns, 'animal'));
    this.questions.push(
        new Question('How much it will bother you that your partner smokes in the apartment ?', defAns, 'smoke'));
    this.questions.push(
        new Question('How much it will bother you that your partner will often host people in the apartment ?', defAns, 'host'));
    this.questions.push(
        new Question('How much do you care if your partner has the same gender as yours ?', defAns, 'gender'));
    this.questions.push(
        new Question('How important it is for you that your partner maintains order and cleanliness in the apartment ?', defAns, 'clean'));
    this.questions.push(
        new Question('How important it is for you that your partner agrees to joint shopping in the apartment ?', defAns, 'shop'));
    this.questions.push(
        new Question('How important it is for you that your partner keeps kosher in the apartment ?', defAns, 'kosher'));
    this.questions.push(
        new Question('How important it is to you that your roommate be a vegetarian ?', defAns, 'vegetarian'));


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
    const arr: {answer, question, id}[] = [];
    // console.log('myAnswers', this.myAnswers);
    for (const question of Object.keys(this.myAnswers)) {
      // console.log('question', question);
      const id: string = this.questions.find(value1 => {
        // console.log('value1', value1);
        return value1.question === question;
      }).id;
      arr.push({answer: this.myAnswers[question], question, id });
    }
    // console.log('arr', arr);

    const value = {userid: this.userId, myAnswers: arr};
    console.log(value); // THIS OBJECT TO SEND!!!!

    this.http.post<any>('https://algapi.herokuapp.com/getuser', value)
        .subscribe(() => {
          this.isLoading = false;
          this.router.navigateByUrl('/places/tabs/discover');
        }, error => {
          console.log('error', error);
        });
  }

  radioGroupChange(question: string, answer: string) {
    // console.log('question', question);
    // console.log('answer', answer);
    this.myAnswers[question] = answer;
    // console.log(this.myAnswers);
    this.myAnsLen = Object.keys(this.myAnswers).length;
  }
}
