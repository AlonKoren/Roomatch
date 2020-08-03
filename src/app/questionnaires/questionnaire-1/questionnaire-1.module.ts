import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Questionnaire1RoutingModule } from './questionnaire-1-routing.module';

import { Questionnaire1Page } from './questionnaire-1.page';

@NgModule({
  imports: [
      FormsModule,
    ReactiveFormsModule,
    CommonModule,
    IonicModule,
    Questionnaire1RoutingModule,
  ],
  declarations: [Questionnaire1Page],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class Questionnaire1PageModule {}
