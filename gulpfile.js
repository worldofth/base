var pkg = require('./package.json');
var gulp = require('gulp');

var $ = require('gulp-load-plugins')({
    pattern: ['*'],
    scope: ['devDependencies']
});

var onError = function(err){
    $.fancyLog.error(err);
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
].join("\n");

// ====================
// css
// ====================

function scss(){
    $.fancyLog('-> Compiling scss');
    return gulp.src(pkg.paths.src.css + pkg.vars.scssName)
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.sourcemaps.init({loadMaps: true}))
        .pipe($.sass({
            includePaths: pkg.paths.src.scss
        }).on('error', $.sass.logError))
        .pipe($.cached('sass_compiler'))
        .pipe($.autoprefixer())
        .pipe($.sourcemaps.write('./'))
        .pipe($.size({gzip: true, showFiles: true}))
        .pipe(gulp.dest(pkg.paths.build.css));
}

function css(){
    $.fancyLog('-> Compiling css');
    return gulp.src(pkg.globs.distCss)
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.newer({dest: pkg.paths.public.css + pkg.vars.cssName}))
        .pipe($.print())
        .pipe($.sourcemaps.init({loadMaps: true}))
        .pipe($.concat(pkg.vars.cssName))
        .pipe($.sourcemaps.write('./'))
        .pipe($.size({gzip: true, showFiles: true}))
        .pipe(gulp.dest(pkg.paths.public.css));
}

function prodCss(){
    $.fancyLog('-> Compiling Production css');
    return gulp.src(pkg.globs.distCss)
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.newer({dest: pkg.paths.production.css + pkg.vars.prodCssName}))
        .pipe($.print())
        .pipe($.sourcemaps.init({loadMaps: true}))
        .pipe($.concat(pkg.vars.prodCssName))
        .pipe($.cssnano({
            discardComments: {
                removeAll: true
            },
            discardDuplicates: true,
            discardEmpty: true,
            minifyFontValues: true,
            minifySelectors: true
        }))
        .pipe($.header(banner))
        .pipe($.sourcemaps.write('./'))
        .pipe($.size({gzip: true, showFiles: true}))
        .pipe(gulp.dest(pkg.paths.production.css));
}

var buildCss = gulp.series(scss, css);
var buildProdCss = gulp.series(scss, prodCss);

// ====================
// js
// ====================

// want to use dev middleware
function jsWebpack(){
    $.fancyLog('-> Bundling JS via webpack ...');

    return gulp.src(pkg.paths.src.js + pkg.vars.jsName)
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.newer({dest: pkg.paths.build.js + pkg.vars.bundledJsName}))
        .pipe($.print())
        .pipe($.webpackStream( require('./webpack.build-config'), null, function(err, stats){
            if(err) {
                $.fancyLog.error(err);
            }else{
                Object.keys(stats.compilation.assets).forEach(function(key){
                    $.fancyLog('Webpack: output ', $.chalk.green(key));
                });
            }
        } ))
        .pipe($.size({gzip: true, showFiles: true}))
        .pipe(gulp.dest(pkg.paths.build.js));
}

// production build
// add header and sort out sourcemaps

// inline js
// for loading stuff

gulp.task('default', jsWebpack);
