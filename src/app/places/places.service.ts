import { Injectable } from '@angular/core';
import {Place} from './place.model';
import {AuthService} from '../auth/auth.service';
import {BehaviorSubject} from 'rxjs';
import {delay, map, take, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  // tslint:disable-next-line:variable-name
  private _places = new BehaviorSubject<Place[]>([
    new Place(
        'p1',
        'Manhattan Mansion',
        'In the heart of New York City.',
        'https://www.filmlocationswanted.com/wp-content/uploads/2015/06/manhattan-estate-mansion60.jpg',
        149.99,
        new Date('2019-01-01'),
        new Date('2019-12-31'),
        'abc'
    ),
    new Place(
        'p2',
        'L\'Amour Toujours',
        'A romantic place in Paris!',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTiHqzuPiuIHSPSVhAh3TpQQbLAeYWX6aQiYQOZjvRHKgfYwhkE&usqp=CAU',
        189.99,
        new Date('2019-01-01'),
        new Date('2019-12-31'),
        'abc'
    ),
    new Place(
        'p3',
        'The Foggy Palace',
        'Not your average city trip!',
        'https://i.pinimg.com/originals/9c/88/44/9c8844b217bdb6c17db14f51ad2e51a5.jpg',
        99.99,
        new Date('2019-01-01'),
        new Date('2019-12-31'),
        'abc'
    )
  ]);

  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService) { }

  getPlace(id: string) {
    return this.places.pipe(
        take(1),
        map(places => {
          return {...places.find(p => p.id === id)};
        })
    );
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
    const newPlace = new Place(
        Math.random().toString(),
        title,
        description,
        'https://www.filmlocationswanted.com/wp-content/uploads/2015/06/manhattan-estate-mansion60.jpg',
        price,
        dateFrom,
        dateTo,
        this.authService.userId
    );
    return this.places.pipe(
        take(1),
        delay(1000),
        tap(places => {
          this._places.next(places.concat(newPlace));
        }));
  }

  updatePlace(placeId: string, title: string, description: string) {
    return this.places.pipe(take(1), delay(1000), tap(places => {
      const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
      const updatedPlaces = [...places];
      const oldPlace = updatedPlaces[updatedPlaceIndex];
      updatedPlaces[updatedPlaceIndex] = new Place(oldPlace.id, title, description, oldPlace.imageUrl, oldPlace.price, oldPlace.availableFrom, oldPlace.availableTo, oldPlace.userId);
      this._places.next(updatedPlaces);
    }));
  }
}
