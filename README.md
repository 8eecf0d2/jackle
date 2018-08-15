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

In Jackle there are a few core modules, **Parser**, **Handler**, **Component**, all modules follow a simple `Object` structure and allow for a lot of flexiblity in regards to how they're composed.

I'm (8eecf0d2) currently learning about [Redux](https://redux.js.org/) and wanted to build a small framework similar to [Jagwah](https://github.com/8eecf0d2/jagwah) but with a more minimal approach and `redux-like` ideas. I'm _not completely sold_ on the immutable wave but it seems interesting enough to give it a crack.

If you get lost or are confused about how Jackle works it's _highly_ recommended to read the source, Jackle is _less than 200 lines_ of _verbose_ and _commented_ code.

### Documentation

All of the documentation is available in the [github wiki](https://github.com/8eecf0d2/jackle/wiki/Home/_edit).
