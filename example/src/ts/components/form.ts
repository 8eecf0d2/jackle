/*
 * jackle - https://github.com/8eecf0d2/jackle
 */

import { Jackle } from 'jackle';
import { TodoState } from '../';

export const form_component: Jackle.component = {
  selector: '#form',
  controller: (state) => {
    return {
      onsubmit: async (event: Event) => {
        event.preventDefault();
        await state.change('save:item', state.temp);
        await state.change('clear:temp', {});
      },
      oninput: async (event: Event) => {
        event.preventDefault();
        await state.change('update:text', event.target);
      }
    }
  },
  template: async (state: TodoState, html, controller) => {
    html`
      <form onsubmit=${controller.onsubmit}>
        <input type="text" oninput=${controller.oninput} value=${state.temp.text}>
        <input type="submit" value=${state.temp.id ? 'update' : 'add'}>
      </form>
    `;
  }
}
