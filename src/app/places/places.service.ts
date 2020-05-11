import { Injectable } from '@angular/core';
import {Place} from './place.model';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  // tslint:disable-next-line:variable-name
  private _places: Place[]  = [
      new Place(
          'p1',
          'Manhattan Mansion',
          'In the heart of New York City.',
          'https://www.filmlocationswanted.com/wp-content/uploads/2015/06/manhattan-estate-mansion60.jpg',
          149.99,
          new Date('2019-01-01'),
          new Date('2019-12-31')
      ),
    new Place(
          'p2',
          'L\'Amour Toujours',
          'A romantic place in Paris!',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTiHqzuPiuIHSPSVhAh3TpQQbLAeYWX6aQiYQOZjvRHKgfYwhkE&usqp=CAU',
          189.99,
          new Date('2019-01-01'),
          new Date('2019-12-31')
      ),
    new Place(
          'p3',
          'The Foggy Palace',
          'Not your average city trip!',
          'https://i.pinimg.com/originals/9c/88/44/9c8844b217bdb6c17db14f51ad2e51a5.jpg',
          99.99,
          new Date('2019-01-01'),
          new Date('2019-12-31')
      )
  ];

  get places() {
    return [...this._places];
  }

  constructor() { }

  getPlace(id: string) {
    return {...this._places.find(p => p.id === id)};
  }
}
