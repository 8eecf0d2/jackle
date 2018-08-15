/*
 * jackle - https://github.com/8eecf0d2/jackle
 */

import { Jackle } from 'jackle';
import { TodoState, TodoItem } from '../';

export const ClearTemp: Jackle.handler = {
  type: 'clear:temp',
  handlers: [
    async (state: TodoState) => {
      state.temp = { id: '', text: '', status: 'incomplete' }
      return state;
    }
  ]
}
