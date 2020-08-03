import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Questionnaire1Page } from './questionnaire-1.page';

const routes: Routes = [
  {
    path: '',
    component: Questionnaire1Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Questionnaire1RoutingModule {}
