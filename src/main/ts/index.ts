/*
 * jackle - https://github.com/8eecf0d2/jackle
 */

import * as hyperhtml from 'hyperhtml/cjs';

export class Jackle {
	public _state: Jackle.state = {};
	private parsers: Jackle.parser.set = {};
	private handlers: Jackle.handler.set = {};
	private components: Jackle.component.set = {};

	constructor() {}

	/**
	 * Register an State (redux-like).
	 */
	public state(state?: Jackle.state) {
		if(!state) {
			return this._state;
		}
		/** update the state with a new one */
		this._state = Object.assign({}, state);

		/** ensure that the `change()` method is set */
		if(!this._state.change) {
			Object.defineProperty(this._state, 'change', { value: this.change.bind(this), enumerable: false });
		}

		/** run an update */
		this.update();
	}

	/**
	 * Register a parser(s) (redux-like action).
	 */
	public parser(parsers: Jackle.parser|Jackle.parser[]) {
		parsers = Array.isArray(parsers) ? parsers : [parsers];
		for(const parser of parsers) {
			this.parsers[parser.name] = parser.parser;
		}
	}

	/**
	 * Register a handler(s) (redux-like reducer).
	 */
	public handler(handlers: Jackle.handler|Jackle.handler[]) {
		handlers = Array.isArray(handlers) ? handlers : [handlers];
		for(const handler of handlers) {
			this.handlers[handler.name] = handler.handlers;
		}
	}

	/**
	 * Change the state by calling a chain of handlers initialized by a parser (redux-like dispatch).
	 */
	public async change(name: string, input: Jackle.parser.input, event?: Event) {
		/** if an event is passed in, call the `preventDefault()` method*/
		if(event) {
			event.preventDefault();
		}
		/** if a parser is registered for this change type, call it */
		const data = this.parsers[name] ? this.parsers[name](input) : input;
		/** iterate over the handlers for this change type */
		for(const handler of this.handlers[name]) {
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
		components = Array.isArray(components) ? components : [components];
		for(const component of components) {
			/** check the desired element is on the dom */
			const node = <HTMLElement>document.querySelector(component.selector);
			if(!node) {
				throw new Error(`Could not find element ${component.selector}`)
			}
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
			this.components[component].template(state, this.components[component].node, controller);
		}
	}
}

export module Jackle {
	/** hyperhtml methods */
	export const wire = hyperhtml.wire;
	export const bind = hyperhtml.bind;
	export const define = hyperhtml.define;

	export type state = {
		change?: Jackle.change;
		[key: string]: any;
	};

	/** parser */
	export module parser {
		export type input = any;
		export type output = any;
		export type func = (data: Jackle.parser.input) => Jackle.parser.output;
		export interface set {
			[parserName: string]: Jackle.parser.func;
		}
	}
	export interface parser {
		name: string;
		parser: Jackle.parser.func;
	}

	/** handler */
	export module handler {
		export type func = (state: Jackle.state, data: Jackle.parser.output) => Jackle.state;
		export interface set {
			[handlerName: string]: Jackle.handler.func[];
		}
	}
	export interface handler {
		name: string;
		handlers: Jackle.handler.func[];
	}

	/** change */
	export type change = (name: string, input: Jackle.parser.input, event?: Event) => any;

	/** component */
	export module component {
		export type template = (state: Jackle.state, node: hyperhtml.BoundTemplateFunction<HTMLElement>, controller?: { [name: string]: any }) => void;
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
