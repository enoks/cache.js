# cache.js

Cache data (also with expiration time) in localStorage (sessionStorage), cookie or [_whatever_ storage you need](#custom-storage).

Lightweight, extendable and plain JS (no frameworks required). AMD or CommonJS ready.

## Usage

```html
<!-- add js file to your HTML -->
<script src="path/to/cache[.min].js" type="text/javascript"></script>

<script type="text/javascript">
    // ... or load script e.g. with RequireJS
    reguire(['cache'], function(cache) {
        // ...
    });
</script>
```

By default there are two `STORAGE` types implemented:

- _localStorage_ (default)
- _cookie_

### Methods

Every storage has five methods<sup>1</sup> to **set**, **get**, **remove** and check (**has** and **is**) data from cache.

_<sup>1</sup> could differ from [custom storages](#custom-storage)_

#### Setter

```js
/**
 * @param {string} KEY
 * @param {mixed} VALUE
 * @param {string} EXPIRES (optional)
 *     undefined == valid for session
 *     date '2017-05-11'
 *     datetime '2017-05-11 09:20'
 *     timespan '1y 2M 3w 4d 5h 6s 7ms' (all optional)
 *     (dates in the past results in removing the cached data)
 * @return cache(STORAGE)
 */
cache(STORAGE).set(KEY, VALUE, EXPIRES);
```

#### Getter

```js
/**
 * @param {string} KEY
 * @param {mixed} DEFAULT_VALUE
 * @return {mixed}
 */
cache(STORAGE).get(KEY, DEFAULT_VALUE);
```

#### Remover

```js
/**
 * @param {string} KEY
 * @return cache(STORAGE)
 */
cache(STORAGE).remove(KEY);
```

#### Tester

```js
/**
 * Check if KEY exists in storage.
 * 
 * @param {string} KEY
 * @return {boolean}
 */
cache(STORAGE).has(KEY);

/**
 * Check if stored KEY value === VALUE.
 * Shortcut of cache(STORAGE).get(KEY, DEFAULT_VALUE) === VALUE
 * 
 * NOT overridable.
 * 
 * @param {string} KEY
 * @param {mixed} VALUE
 * @param {mixed} DEFAULT_VALUE
 * @return {boolean}
 */
cache(STORAGE).is(KEY, VALUE, DEFAULT_VALUE);
```

### Custom storage

You need other storages!? No problem! Just add your own storage:

```js
/**
 * @param {string} STORAGE_NAME
 * @param {object} METHODS
 */
cache('addStorage', STORAGE_NAME, METHODS);
```

## Questions, concerns, needs, suggestions?

Don't hesitate! [Issues](https://github.com/enoks/cache.js/issues) welcome.
