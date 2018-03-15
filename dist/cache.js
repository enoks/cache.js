/**
 * cache v1.1.0
 * https://github.com/enoks/cache.js
 *
 * Copyright 2018, Stefan Käsche
 * https://github.com/enoks
 *
 * Licensed under MIT
 * https://github.com/enoks/peekaboo.js/blob/master/LICENSE
 */

;
( function( context, definition ) {
    'use strict';

    // AMD module
    if ( typeof define === 'function' && define.amd ) {
        define( 'cache', [], function() {
            return definition;
        } );
    } // CommonJS module
    else if ( typeof module === 'object' && typeof module.exports === 'object' ) {
        module.exports = definition;
    } else {
        window.cache = definition;
    }
} )( this, function( undefined ) {
    "use strict";

    // all available storages
    // by default there are 'localStorage' and 'cookie' (@see below)
    var storages = {},

        cache = function() {
            // 'localStorage' is default
            switch ( arguments[ 0 ] = arguments[ 0 ] || 'localStorage' ) {
                case 'addStorage':
                    if ( !arguments[ 1 ] )
                        return console.error( 'No storage name!? This can not work.' );

                    // storage with this name already exists!?
                    if ( !!storages[ arguments[ 1 ] ] )
                        return console.error( 'Storage "' + arguments[ 1 ] + '" already exists.' );

                    storages[ arguments[ 1 ] ] = arguments[ 2 ] || {};

                    return cache( arguments[ 1 ] );

                case 'removeStorage':
                    return delete storages[ arguments[ 1 ] ];

                    // access specific storage and its methods
                    // default storage (defined above) is the browser's localStorage
                    // or sessionStorage for session based data cache
                default:
                    if ( !storages[ arguments[ 0 ] ] ) {
                        console.error( 'No "' + arguments[ 0 ] + '" storage/cache available. Please choose "' + Object.keys( storages ).join( '", "' ) + '".' );
                    }

                    var methods = storages[ arguments[ 0 ] ] || {};
                    if ( Object.prototype.toString.call( methods ) != '[object Object]' ) methods = {};

                    // default setter
                    if ( !methods.set ) methods[ 'set' ] = function() {
                        return this;
                    };

                    // default getter
                    if ( !methods.get ) methods[ 'get' ] = function( key, defaultValue ) {
                        return typeof defaultValue == 'undefined' ? null : defaultValue;
                    };

                    // default remover
                    if ( !methods.remove ) methods[ 'remove' ] = function() {
                        return this;
                    };

                    return methods;
            }
        };

    /**
     * Add localStorage as cache's storage.
     */

    cache( 'addStorage', 'localStorage', {
        set: function( key, value, expires ) {
            this.remove( key );

            // only save data for this session
            if ( typeof expires == 'undefined' || expires.trim() == '' ) {
                sessionStorage.setItem( key, JSON.stringify( value ) );
            } else {
                localStorage.setItem( key, JSON.stringify( {
                    data: value,
                    expires: _parseDateTo( expires )
                } ) );
            }

            return this;
        },

        get: function( key, defaultValue ) {
            var data, value = sessionStorage.getItem( key );

            // sessionStorage
            if ( value !== null ) {
                try {
                    data = JSON.parse( value );
                    value = data;
                } catch ( e ) {}
            }
            // localStorage
            else {
                value = localStorage.getItem( key );

                try {
                    data = JSON.parse( value );

                    if ( data.expires && Date.now() > Date.parse( data.expires ) ) {
                        this.remove( key );
                        value = null;
                    } else value = data.data || null;
                } catch ( e ) {}
            }

            return value != null ?
                value : ( typeof defaultValue != 'undefined' ? defaultValue : null );
        },

        remove: function( key ) {
            sessionStorage.removeItem( key );
            localStorage.removeItem( key );

            return this;
        }
    } );

    /**
     * Add cookie as cache's storage.
     */

    cache( 'addStorage', 'cookie', {
        set: function( key, value, expires ) {
            value = value || '';
            if ( typeof value != 'string' ) value = JSON.stringify( value );
            var cookie = [ key + '=' + value, 'path=/' ];

            if ( typeof expires != 'undefined' && expires.trim() != '' ) {
                expires = _parseDateTo( expires );
                if ( expires ) cookie.push( 'expires=' + expires );
            }

            // eventually set cookie
            document.cookie = cookie.join( ';' );

            return this;
        },

        get: function( key, defaultValue ) {
            var value;

            decodeURIComponent( document.cookie ).split( ';' ).forEach( function( cookie ) {
                if ( typeof value == 'undefined' && cookie.trim().indexOf( key + '=' ) == 0 ) {
                    value = cookie.replace( new RegExp( '^\\s*' + key + '=' ), '' );
                }
            } );

            if ( typeof value == 'undefined' ) {
                value = typeof defaultValue != 'undefined' ? defaultValue : null;
            } else try {
                JSON.parse( value );
                value = JSON.parse( value );
            }
            catch ( e ) {}

            return value;
        },

        remove: function( key ) {
            this.set( key, null, '-1s' );
            return this;
        }
    } );

    /**
     * Helper functions.
     */

    // retrieve timestamp/~string of requested date
    function _parseDateTo( date, to ) {
        // normalize
        date = date.replace( /(\d+)/g, ' $1' ).replace( /\s+/g, ' ' ).trim();

        // e.g. 1y 2M 3w 4d 5h 6m 7s 8ms
        if ( /^-?\d+[yMwdhms]( -?\d+[yMwdhms])*$/.test( date ) ) {
            var years = date.match( /\d+y/g ); // years
            var months = date.match( /\d+M/g ); // month

            date = date.replace( 'w', '*1000*60*60*24*7' ) // weeks
                .replace( 'd', '*1000*60*60*24' ) // days
                .replace( 'h', '*1000*60*60' ) // hours
                .replace( /(\d+y|\d+M|ms|)/g, '' ) // years, months or milliseconds
                .replace( 'm', '*1000*60' ) // minutes
                .replace( 's', '*1000' ); // seconds

            // calculate date
            date = new Date( Date.now() + ( eval( date.replace( /\s+/, '+' ) ) || 0 ) ); // weeks and 'below'
            ( years || [] ).forEach( function( year ) {
                date.setFullYear( date.getFullYear() + parseInt( year ) );
            } ); // add years
            ( months || [] ).forEach( function( month ) {
                date.setMonth( date.getMonth() + parseInt( month ) );
            } ); // add months
        }
        // parse date
        else date = new Date( date );

        // sth. wrong :/ invalid date
        if ( isNaN( date.getTime() ) ) {
            console.warn( '"' + arguments[ 0 ] + '" is an invalid date :/ Please see https://github.com/enoks/cache.js#setter for more information.' );
            return null;
        }

        switch ( ( to || 'utc' ).toLowerCase() ) {
            case 'time':
            case 'timestamp':
                return date.getTime();

            default:
            case 'utc':
                return date.toUTCString();
        }
    }

    // eventually return cache
    return cache;

}() );