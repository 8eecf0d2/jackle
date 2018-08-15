/*
 * jackle - https://github.com/8eecf0d2/jackle
 */

import * as hyperhtml from 'hyperhtml/cjs';

export class Jackle {
  public _state: Jackle.state = {};
  private handlers: Jackle.handler.set = {};
  private components: Jackle.component.set = {};

  constructor() {}

  /**
   * Set or return the state (redux-like).
   */
  public state(state?: Jackle.state) {
    /** if no state is passed in, consider 🦆's, return the state */
    if(!state) {
      return this._state;
    }
    /** update the state with a "new" one */
    this._state = Object.assign({}, state);

    /** ensure that the `change()` method is set */
    if(!this._state.change) {
      Object.defineProperty(this._state, 'change', { value: this.change.bind(this), enumerable: false });
    }

    /** run an update */
    this.update();
  }

  /**
   * Register a handler(s) (redux-like action and reducer).
   */
  public handler(handlers: Jackle.handler|Jackle.handler[]) {
    /** if `handlers` argument is not an array, turn into an array */
    handlers = Array.isArray(handlers) ? handlers : [handlers];
    /** iterate over array of handlers */
    for(const handler of handlers) {
      /** "register" the handler based on type (will replace existing handler using same type) */
      this.handlers[handler.type] = {
        parser: handler.parser,
        handlers: handler.handlers,
      }
    }
  }

  /**
   * Change the state by calling a chain of handlers initialized by a parser (redux-like dispatch).
   */
  public async change(type: string, input: Jackle.handler.parser.input) {
    /** if the handler doesn't exist throw an error */
    if(!this.handlers[type]) {
      throw new Error(`Handler for ${type} doesn't exist`);
    }
    /** if the handler has a parser, call it */
    const data = this.handlers[type].parser ? this.handlers[type].parser(input) : input;
    /** iterate over the handlers for this change type */
    for(const handler of this.handlers[type].handlers) {
      let state: Jackle.state;
      try {
        /** set the handlers return value as a _temporary_ state object, passing in the latest state and parsed data */
        state = await handler(Object.assign({}, this._state), data);
      } catch(error) {
        /** if the handler errors, throw it to the caller */
        throw error;
      }
      /** no errors occured, update the state*/
      this.state(state);
    }
  }

  /**
   * Register a component(s).
   */
  public component(components: Jackle.component|Jackle.component[]) {
    /** if `components` argument is not an array, turn into an array */
    components = Array.isArray(components) ? components : [components];
    for(const component of components) {
      /** check the desired element is on the dom */
      const node = <HTMLElement>document.querySelector(component.selector);
      if(!node) {
        /** throw if the element is missing*/
        throw new Error(`Could not find element ${component.selector}`)
      }
      /** "register" the component based on selector (will replace existing component using same selector) */
      this.components[component.selector] = {
        node: hyperhtml.bind(node),
        ...component,
      };
    }
  }

  /**
   * Update components (dom)
   */
  public update() {
    /** iterate over the currently registered components */
    for(const component in this.components) {
      /** store a frozen copy of the state */
      const state = Object.freeze(this._state);
      /** if the template has a controller, call it and pass in the frozen state */
      const controller = this.components[component].controller ? this.components[component].controller(state) : undefined;
      /** call the template update method and pass in the frozen state, along with the controller (if defined) */
      this.components[component].template(state, this.components[component].node, controller)
    }
  }
}

export namespace Jackle {
  /** hyperhtml methods */
  export const wire = hyperhtml.wire;
  export const bind = hyperhtml.bind;
  export const html = hyperhtml.hyper;
  export const define = hyperhtml.define;

  export type state = {
    change?: Jackle.change;
    [key: string]: any;
  };


  /** handler */
  export namespace handler {
    export namespace parser {
      export type input = any;
      export type output = any;
      export type func = (data: Jackle.handler.parser.input) => Jackle.handler.parser.output;
    }
    export type func = (state: Jackle.state, data: Jackle.handler.parser.output) => Promise<Jackle.state>;
    export interface set {
      [handlerName: string]: {
        parser: Jackle.handler.parser.func;
        handlers: Jackle.handler.func[];
      }
    }
  }
  export interface handler {
    type: string;
    parser?: Jackle.handler.parser.func;
    handlers: Jackle.handler.func[];
  }

  /** change */
  export type change = (type: string, input: Jackle.handler.parser.input, event?: Event) => Promise<any>;

  /** component */
  export namespace component {
    export type template = (state: Jackle.state, html: hyperhtml.BoundTemplateFunction<HTMLElement>, controller?: { [name: string]: any }) => void;
    export type controller = (state: Jackle.state) => { [name: string]: any };
    export interface set {
      [componentName: string]: {
        node: hyperhtml.BoundTemplateFunction<HTMLElement>;
        selector: string;
        template: Jackle.component.template;
        controller?: Jackle.component.controller;
      }
    }
  }
  export interface component {
    selector: string;
    template: Jackle.component.template;
    controller?: Jackle.component.controller;
  }
}
