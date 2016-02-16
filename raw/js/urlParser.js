'use strict';

var EarthWebGLDemo = EarthWebGLDemo || {};

/**
 * URL parser, currently supports getting query string values by key
 * @return {object} URL parser
 */
EarthWebGLDemo.urlParser = {

    /**
     * Get query string value by key
     * @param  {string} key
     * @return {string} value
     */
    getQueryValueByKey: (key) => {

        //TODO: pass in url instead of accessing window.location directly
        let query = window.location.search.substring(1);
        let vars = query.split('&');

        for (let i = 0; i < vars.length; i++) {
            let pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]).toUpperCase() === key.toUpperCase()) {
                return decodeURIComponent(pair[1]);
            }
        }
    }
};