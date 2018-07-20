/*
 * jackle - https://github.com/8eecf0d2/jackle
 */

import * as hyperhtml from 'hyperhtml/cjs';

export class Jackle {
	public _state: Jackle.state = {};
	private parsers: Jackle.parser.set = {};
	private handlers: Jackle.handler.set = {};
	private components: Jackle.component.set = {};
	private routes: Jackle.route.set = [];

	constructor() {}

	/**
	 * Register an State (redux-like).
	 */
	public state(state?: Jackle.state) {
		if(!state) {
			return this._state;
		}
		this._state = Object.assign({}, state);
		if(!this._state.change) {
			Object.defineProperty(this._state, 'change', { value: this.change.bind(this), enumerable: false });
		}
		this.update();
	}

	/**
	 * Register an parser (redux-like action).
	 */
	public parser(parsers: Jackle.parser|Jackle.parser[]) {
		parsers = Array.isArray(parsers) ? parsers : [parsers];
		for(const parser of parsers) {
			this.parsers[parser.name] = parser.parser;
		}
	}

	/**
	 * Register a handler (redux-like reducer).
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
		if(event) {
			event.preventDefault();
		}
		const data = this.parsers[name] ? this.parsers[name](input) : input;
		for(const handler of this.handlers[name]) {
			let state: Jackle.state;
			try {
				state = await handler(Object.assign({}, this._state), data);
			} catch(error) {
				throw error;
			}
			this.state(state);
		}
	}

	/**
	 * Register a component.
	 */
	public component(components: Jackle.component|Jackle.component[]) {
		components = Array.isArray(components) ? components : [components];
		for(const component of components) {
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
	 * Register a route.
	 */
	public route(routes: Jackle.route|Jackle.route[]) {
		routes = Array.isArray(routes) ? routes : [routes];
		this.routes.push(...routes);
	}

	/**
	 * Update components (dom)
	 */
	public update() {
		for(const component in this.components) {
			const state = Object.freeze(this._state);
			this.components[component].template(state, this.components[component].node, this.components[component].controller ? this.components[component].controller(state) : undefined);
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

	/** route */
	export module route {
		export type func = (state: Jackle.state, context: Jackle.route.context, change: Jackle.change) => void;
		export interface context {
			path: string;
			params: {
				[param: string]: string;
			}
		}
		export type set = Jackle.route[];
	}
	export interface route {
		path: RegExp;
		handlers: Jackle.route.func[];
	}
}
