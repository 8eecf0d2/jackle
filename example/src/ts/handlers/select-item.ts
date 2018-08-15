/*
 * jackle - https://github.com/8eecf0d2/jackle
 */

import { Jackle } from 'jackle';
import { TodoState, TodoItem } from '../';

export const SelectItem: Jackle.handler = {
  type: 'select:item',
  handlers: [
    /** the handler will find an item by id and set it to the 'temp' property */
    async (state: TodoState, id: string) => {
      state.temp = {
        /** copy the item matching the id */
        ...state.items.find(item => item.id === id)
      }
      return state;
    }
  ]
}
