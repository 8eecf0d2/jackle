/*
 * jackle - https://github.com/8eecf0d2/jackle
 */

import { Jackle } from 'jackle';

/** import the handlers and components as keyed objects */
import * as handlers from './handlers';
import * as components from './components';

/** create a new Jackle application */
const jackle = new Jackle();

/** set the initial state of our application */
jackle.state({ items: [], temp: {} });

/** load the handlers and components as an array */
jackle.handler(Object.values(handlers));
jackle.component(Object.values(components));

/** update call to run the first DOM update */
jackle.update();

/** define the application state by extending the `Jackle.state` */
export interface TodoState extends Jackle.state {
  items: TodoItem[];
  temp: TodoItem;
}

/** define a todo item used within the application */
export interface TodoItem {
  id: string;
  text: string;
  status: 'incomplete'|'complete';
}
