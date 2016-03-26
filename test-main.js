/*global require*/
(function() {
    'use strict';
    var allTestFiles;

    function isTestFile(file) {
        return (file.indexOf('test/specs/') === 0);
    }

    // Get a list of all the test files to include
    allTestFiles = Object.keys(window.__karma__.files).filter(isTestFile);

    require.config({
        // Karma serves files under /base, which is the basePath from your config file
        baseUrl: '/base/src',

        // dynamically load all test files
        deps: allTestFiles,

        // we have to kickoff jasmine, as it is asynchronous
        callback: window.__karma__.start
    });
}());