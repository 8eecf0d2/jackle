# Jackle

[![Travis CI badge](https://travis-ci.org/8eecf0d2/jackle.svg?branch=master)](https://travis-ci.org/8eecf0d2/jackle)
[![Codeclimate maintainability](https://img.shields.io/codeclimate/maintainability-percentage/8eecf0d2/jackle.svg)](https://codeclimate.com/github/8eecf0d2/jackle)
[![Greenkeeper badge](https://badges.greenkeeper.io/8eecf0d2/jackle.svg)](https://greenkeeper.io/)
[![Bundlephobia minified badge](https://img.shields.io/bundlephobia/min/jackle.svg)](https://bundlephobia.com/result?p=jackle@latest)
[![Bundlephobia minified zipped badge](https://img.shields.io/bundlephobia/minzip/jackle.svg)](https://bundlephobia.com/result?p=jackle@latest)

Jackle is a tiny and _experimental_ framework for building `redux-like` web applications. It exposes a small API for managing components, state changes, routing and more!

## Getting Started

Install with yarn or npm​

```bash
yarn add jackle
```

Import and start using

```ts
import { Jackle } from 'jackle';
​
const jackle = new Jackle();
jackle.parser([...]);
jackle.handler([...]);
jackle.component([...]);
jackle.route([...]);
```

## API

Additional documentation and guides can be found in [the github wiki](https://github.com/8eecf0d2/jackle/wiki).

### Overview

In Jackle there are a few core modules, **Parser**, **Handler**, **Component** and **Route**, all modules follow a simple `Object` structure and allow for a lot of flexiblity in regards to how they're composed.

I'm (8eecf0d2) currently learning about [Redux](https://redux.js.org/) and wanted to build a small framework similar to [Jagwah](https://github.com/8eecf0d2/jagwah) but with a more minimal approach and `redux-like` ideas. I'm _not completely sold_ on the immutable wave but it seems interesting enough to give it a crack.

If you get lost or are confused about how Jackle works it's _highly_ recommended to read the source, Jackle is _less than 200 lines_ of _verbose_ and _commented_ code.

### Parser

A Parser is similar to an `Action` in redux, it's used to format input and which can be used by a `handler`.

To register a parser use `jackle.parser(parser: Jackle.parser|Jackle.parser[])`.

The example below expects an `input` element to be passed in and it returns that element's `value`.

```ts
const update_temp_parser: Jackle.parser = {
  name: 'update:temp',
  parser: (input: HTMLInputElement) => {
    return input.value;
  }
}

jackle.parser(update_temp_parser);
```

### Handler

A Handler is similar to a `Reducer` in redux, it's purpose is to change the `state` of the application, it recieves data from a `parser` and decides what needs to change in the `state`.

To register a handler use `jackle.handler(handler: Jackle.handler|Jackle.handler[])`

The example below recieves the return value from the `input` element Parser above, and returns a modified state.

```ts
const update_temp_handler: Jackle.handler = {
  name: 'update:temp',
  handlers: [
    (state: State, text: string) => {
      state.temp = {
        text: text
      }
      return state;
    }
  ]
}

jackle.handler(update_temp_handler);
```

Handlers can be `async` and you can provide an array of `functions` to simplify duties, each handler **must** return a state object.

The example below first checks that the `text` argument is at least _10 characters long_, before continuing and modifying the state.

If a Handler throws an error the chain will stop.

```ts
export const update_temp_handler: Jackle.handler = {
  name: 'update:temp',
  handlers: [
    (state, text: string) => {
      if(text.length < 10) {
        throw new Error('Text must be at least 10 characters long')
      }
      return state;
    },
    (state, text: string) => {
      state.temp = {
        text: text
      }
      return state;
    }
  ]
}

jackle.handler(update_temp_handler);
```

### Change

The `change` method in Jackle is similar to `Dispatch` in redux, it's used to attempt changes the state - you can access it directly from a Jackle instance with `jackle.change()`, or from the state with `state.change()`.

To call the change method use `jackle.change()` or `state.change()`.

If you call the `change` method and a `handler` throws an error, the error will bubble to the caller - so be ready to catch them.

The example below calls the `update:temp` example from above.

```ts
jackle.change('update:temp', document.querySelector('input'));
// this calls the update:temp parser
// which is then passed into the update:temp handler
```

### Component

Components are a used to create html, you **must** provide a `selector` value which will be used to bind to an element on the dom with `document.querySelector(selector)`.

To register a component use `jackle.component(component: Jackle.component|Jackle.component[])`.

The Component `template` property will be called **every** time the state changes, the `template` property can be `async` and will be given three arguments, `state`, `html` and `controller`.

The `state` argument is a frozen (`Object.freeze()`) copy of the state, this is because all changes to the state should be performed by calling the `change` method.
The `html` argument is a `hyperhtml.BoundTemplateFunction<HTMLElement>` function, which is more or less a `string -> html` function, [learn more here](https://viperhtml.js.org/hyperhtml/documentation/#api-0).
The `controller` argument will only be provided if there was a `controller` defined for the component.

The example below will use `document.querySelector()` to find an element matching `#form` and then output the tagged template literal result to the DOM.

```ts
export const form_component: Jackle.component = {
  selector: '#form',
  template: async (state, html) => {
    html`
      <form>
        <input type="text" value=${state.temp.text}>
      </form>
    `;
  }
}
```

```html
<body>
  <div id="form">
    <!-- <form> element will be placed here -->
  </div>
</body>
```

That example is pretty straight forward, to take it further we can bind the `input` element's value with the state, to do this we can use the `change()` method when the `input` element value changes.
To implement this we can set an event handler for the `input` elements `onchange` or `oninput` events.

```ts
export const form_component: Jackle.component = {
  selector: '#form',
  template: async (state, html) => {
    html`
      <form>
        <input type="text" oninput=${(event: Event) => state.change('update:temp', e.target)} value=${state.temp.text}>
      </form>
    `;
  }
}
```

However, writing long lambdas within element attributes can get hard to read pretty quickly, so we can write a simple `controller` for handling these interactions.

```ts
export const form_component: Jackle.component = {
  selector: '#form',
  controller: (state) => {
    return {
      oninput: (event: Event) => {
        state.change('update:temp', event.target);
      }
    }
  },
  template: async (state, html, controller) => {
    html`
      <form>
        <input type="text" oninput=${controller.oninput} value=${state.temp.text}>
      </form>
    `;
  }
}
```

Personally I'm a fan of keeping file counts to a minimum but since Components are simple objects you can move the `controller` and `template` properties into separate files and change the structure to suit your needs.

`components/form/form.component.ts`
```ts
import { controller } from './form.controller';
import { template } from './form.template';

export const form_component: Jackle.component = {
  selector: '#form',
  controller: controller,
  template: template,
}
```

`components/form/form.controller.ts`
```ts
export const controller: Jackle.component.controller = (state) => {
  return {
    oninput: (event: Event) => {
      state.change('update:temp', event.target);
    }
  }
}
```

`components/form/form.template.ts`
```ts
export const template: Jackle.component.template = async (state, html, controller) => {
  html`
    <form>
      <input type="text" oninput=${controller.oninput} value=${state.temp.text}>
    </form>
  `;
}
```

_Doing this does mean you'll lose the easily inferred types, so you'll need to wire them out separately._

You can also take the idea of components _much_ further by also mixing in [hyperHTML components](https://viperhtml.js.org/hyperhtml/documentation/#components).
