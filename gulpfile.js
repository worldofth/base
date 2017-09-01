var pkg = require('./package.json');
var gulp = require('gulp');
var isProd = (process.env.NODE_ENV === 'production');

var $ = require('gulp-load-plugins')({
    pattern: ['*'],
    scope: ['devDependencies']
});

var onError = function(err){
    $.fancyLog.error(err);
};

var browserSyncInstance = $.browserSync.create();
var reload = function(done){
    browserSyncInstance.reload();
    done && done();
};

var banner = require('./banner');

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
        .pipe($.rev())
        .pipe($.sourcemaps.write('./'))
        .pipe($.size({gzip: true, showFiles: true}))
        .pipe(gulp.dest(pkg.paths.production.css))
        .pipe($.rev.manifest('manifest.json'))
        .pipe(gulp.dest(pkg.paths.production.css));
}

function cleanCss(done){
    $.fancyLog('-> Cleaning production js folder');

    $.rimraf(pkg.paths.production.css, done);
}

var buildCss = gulp.series(scss, css, reload);
if(isProd){
    buildCss = gulp.series(scss, cleanCss, prodCss, reload);
}

// ====================
// Critical css
// ====================

// todo

// ====================
// js
// ====================

function js(){
    if(isProd){
        $.fancyLog('-> Bundling JS via webpack ...');
    }else{
        $.fancyLog('-> Bundling Production JS via webpack ...');
    }

    var newerFileDest = pkg.paths.build.js + pkg.vars.bundledJsName;
    var jsDest = pkg.paths.public.js;
    if(isProd){
        newerFileDest = pkg.paths.production.js + pkg.vars.prodJsName;
        jsDest = pkg.paths.production.js;
    }

    return gulp.src(pkg.paths.src.js + pkg.vars.jsName)
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.newer({dest: newerFileDest}))
        .pipe($.print())
        .pipe($.webpackStream( require('./webpack.config')(), null, function(err, stats){
            if(err) {
                $.fancyLog.error(err);
            }
        } ))
        .pipe($.size({gzip: true, showFiles: true}))
        .pipe(gulp.dest(jsDest));
}

function cleanJS(done){
    var jsDest = pkg.paths.build.js;

    if(isProd){
        jsDest = pkg.paths.production.js;
        $.fancyLog('-> Cleaning production js folder');
    }else{
        $.fancyLog('-> Cleaning js folder');
    }

    $.rimraf(jsDest, done);
}

function jsDev(){
    return $.webpackDevMiddleware( $.webpack( require('./webpack.config')(true) ), {
        publicPath: '/js/',
        reporter: function(obj){
            if(!obj.stats){
                return;
            }

            if(obj.stats.compilation.errors){
                obj.stats.compilation.errors.forEach(function(err){
                    $.fancyLog.error(err);
                });
            }

            if(obj.stats.compilation.warnings){
                obj.stats.compilation.warnings.forEach(function(warn){
                    $.fancyLog.warning(err);
                });
            }

            Object.keys(obj.stats.compilation.assets).forEach(function(key){
                $.fancyLog('Webpack: updated ', $.chalk.green(key));
            });

            reload();
        }
    });
}

function inlineJs(){
    $.fancyLog('-> Copying inline js');

    var inlineDest = pkg.paths.public.vendorjs;
    if(isProd){
        inlineDest = pkg.paths.production.vendorjs;
    }

    return gulp.src(pkg.globs.inlineJs)
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.newer({dest: inlineDest}))
        .pipe($.size({gzip: true, showFiles: true}))
        .pipe(gulp.dest(inlineDest));
}

var buildJS = gulp.series(cleanJS, js, inlineJs);

// ====================
// Assets
// ====================

// todo
// copying assets around

// ====================
// SVG Icons
// ====================

// todo

// ====================
// testing
// ====================

// todo

// ====================
// Pattern Lab
// ====================

// todo

// ====================
// Tasks
// ====================

//testing
function browserSync(done){
    var path = pkg.paths.public.base;
    if(isProd){
        path = pkg.paths.production.base
    }

    browserSyncInstance.init({
        server: {
            baseDir: path
        },
        middleware: [
            jsDev()
        ]
    }, function(){
        $.fancyLog('-> Starting BrowserSync');
        done && done();
    })
}

function defaultTask(done){
    gulp.watch([pkg.paths.src.css + '**/*.scss'], buildCss);
    gulp.watch([pkg.paths.src.css + '**/*.css'], buildCss);
    gulp.watch([pkg.paths.production.base + '*.html'], reload);
    gulp.watch([pkg.paths.public.base + '*.html'], reload);
    browserSync(done);
}

gulp.task('build', gulp.parallel(buildCss, buildJS));
gulp.task('default', defaultTask);
