import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { Questionnaire1Page } from './questionnaire-1.page';

describe('NewOfferPage', () => {
  let component: Questionnaire1Page;
  let fixture: ComponentFixture<Questionnaire1Page>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Questionnaire1Page ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Questionnaire1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
