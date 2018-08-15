/*
 * jackle - https://github.com/8eecf0d2/jackle
 */

import { Jackle } from 'jackle';
import { TodoState, TodoItem } from '../';

export const UpdateStatus: Jackle.handler = {
  type: 'update:status',
  handlers: [
    /** the handler find the item and update its status */
    async (state: TodoState, data: { id: string, status: 'incomplete'|'complete' }) => {
      state.items = state.items.map(item => {
        /** if this item id matches, set the status */
        if(item.id === data.id) {
          item.status = data.status;
        }
        return item;
      })
      return state;
    }
  ]
}
