var pkg = require('./package.json');
var gulp = require('gulp');

var $ = require('gulp-load-plugins')({
    pattern: ['*'],
    scope: ['devDependencies']
});

var onError = function(err){
    $.fancyLog.err(err);
};

var banner = [
    '/**',
    ' * @project        ' + pkg.name,
    ' * @author         ' + pkg.author,
    ' * @build          ' + $.moment().format('llll') + ' GMT',
    ' * @release        ' + $.gitRevSync.long() + ' [' + $.gitRevSync.branch() + ']',
    ' @copyright        Copyright (c) ' + $.moment().format('YYYY') + ', ' + pkg.copyright,
    ' *',
    ' */',
    ''
].join("/n");
