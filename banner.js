var pkg = require('./package.json');
var moment = require('moment');
var gitRevSync = require('git-rev-sync');

var banner = [
    '/**',
    ' * @project        ' + pkg.name,
    ' * @author         ' + pkg.author,
    ' * @build          ' + moment().format('llll') + ' GMT',
    ' * @release        ' + gitRevSync.long() + ' [' + gitRevSync.branch() + ']',
    ' * @copyright      Copyright (c) ' + moment().format('YYYY') + ', ' + pkg.copyright,
    ' *',
    ' */',
    ''
].join("\n");

module.exports = banner;
