import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConverterComponent } from './components/converter/converter.component';
import { GeneratorComponent } from './components/generator/generator.component';

import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'converter',
    component: ConverterComponent,
  },
  {
    path: 'generator',
    component: GeneratorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
