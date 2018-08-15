/*
 * jackle - https://github.com/8eecf0d2/jackle
 */

import { Jackle } from 'jackle';
import { TodoState, TodoItem } from '../';

export const SaveItem: Jackle.handler = {
  type: 'save:item',
  parser: (item: Partial<TodoItem>) => {
    /** return a copy of the item */
    return { ...item };
  },
  handlers: [
    /** the first handler will check the item being added has text */
    async (state: TodoState, item: Partial<TodoItem>) => {
      /** if the item doesn't have any text, we'll throw an error */
      if(!item.text) {
        throw new Error('invalid item');
      }
      /** if the item doesn't have an id, create one */
      if(!item.id) {
        item.id = (new Date().getTime() + Math.random()).toString();
      }
      /** if the item doesn't have a status, set it to incomplete */
      if(!item.status) {
        item.status = 'incomplete';
      }
      return state;
    },
    /**
     * the second handler will check if the item already exists
     * if it does then it will update it, otherwise it will add it
    */
    async (state: TodoState, item: TodoItem) => {
      /** find the item by index */
      const index = state.items.findIndex(_item => _item.id === item.id);
      if(index > -1) {
        /** if it exists, assign the old item to the new one */
        state.items[index] = item;
      } else {
        /** otherwise push it to the list of items */
        state.items.push(item);
      }
      return state;
    }
  ]
}
