/*
 * jackle - https://github.com/8eecf0d2/jackle
 */

import { Jackle } from 'jackle';
import { TodoState, TodoItem } from '../';

export const ListComponent: Jackle.component = {
  selector: '#list',
  controller: (state) => {
    return {
      status: (item: TodoItem) => {
        state.change('update:status', {
          id: item.id,
          status: item.status === 'incomplete' ? 'complete' : 'incomplete',
        });
      },
      select: (item: TodoItem) => {
        state.change('select:item', item.id);
      },
      style: (item: TodoItem): Partial<CSSStyleDeclaration> => {
        return {
          textDecoration: item.status === 'incomplete' ? 'none' : 'line-through',
          color: item.status === 'incomplete' ? 'black' : 'green',
        }
      }
    }
  },
  template: (state: TodoState, html, controller) => {
    html`
      <ul>
        ${state.items.map(item => {
          return Jackle.wire(item)`
            <li style=${controller.style(item)}>
              ${item.text}
              <em onclick=${() => controller.status(item)}>toggle</em>
              <strong onclick=${() => controller.select(item)}>select</strong>
            </li>
          `;
        })}
      </ul>
    `;
  }
}
