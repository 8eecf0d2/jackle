/*
 * jackle - https://github.com/8eecf0d2/jackle
 */

import { Jackle } from 'jackle';
import { TodoState, TodoItem } from '../';

export const StateComponent: Jackle.component = {
  selector: '#state',
  template: (state: TodoState, html) => {
    html`
      <pre>${JSON.stringify(state, null, 2)}</pre>
    `;
  }
}
