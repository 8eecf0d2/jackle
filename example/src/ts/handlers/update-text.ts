/*
 * jackle - https://github.com/8eecf0d2/jackle
 */

import { Jackle } from 'jackle';
import { TodoState, TodoItem } from '../';

export const UpdateText: Jackle.handler = {
  type: 'update:text',
  /** the parser will get the input element's value */
  parser: (input: HTMLInputElement) => {
    return input.value;
  },
  handlers: [
    /** the handler will update the 'temp' item */
    async (state: TodoState, text: string) => {
      state.temp.text = text;
      return state;
    }
  ]
}
