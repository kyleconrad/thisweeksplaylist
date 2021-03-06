var gulp = require('gulp'),

	// Server and sync
	browserSync = require('browser-sync'),

	// Other plugins
	rimraf = require('rimraf'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	concat = require('gulp-concat'),
	es = require('event-stream'),
	minify = require('gulp-minify-css'),
	uglify = require('gulp-uglify'),
	imagemin = require('gulp-imagemin'),
	chmod = require('gulp-chmod'),
	gutil = require('gulp-util'),
	rsync = require('rsyncwrapper').rsync,
	folderIndex = require('gulp-folder-index');



// Server initiation and livereload, opens server in browser
gulp.task('serve', function() {
	browserSync.init(null, {
		server: {
			baseDir: './prod'
		},
		host: 'localhost'
    });
});


// Indexing music
var musicSource = '../Music/2016/07-17-16/*.mp3';

gulp.task('index', function() {
	gulp.src(musicSource)
		.pipe(folderIndex({
			extension: ' ',
			filename: 'music.json',
			prefix: ''
		}))
		.pipe(gulp.dest('./prod/js'));
});


// SASS compiling & reloading
gulp.task('sass', function() {
    gulp.src('./prod/sass/*.scss')
	    .pipe(sourcemaps.init())
        .pipe(sass({
        	errLogToConsole: true
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./prod/css'))
        .pipe(browserSync.reload({
        	stream: true
        }));
});


gulp.task('remove', function (cb) {
    rimraf('./dist', cb);
});

gulp.task('minify', ['sass'], function() {
	return gulp.src('./prod/css/*.css')
		.pipe(minify({
			keepSpecialComments: 0
		}))
		.pipe(gulp.dest('./dist/css'));
});

gulp.task('uglify', ['minify', 'index'], function() {
	return es.merge(
		gulp.src('./prod/js/*.js')
	      	.pipe(uglify())
	      	.pipe(gulp.dest('./dist/js')),
	    gulp.src('./prod/js/*.json')
			.pipe(gulp.dest('./dist/js'))
    );
});

gulp.task('html', ['uglify'], function() {
	return gulp.src("./prod/**/*.html")
	  	.pipe(gulp.dest('./dist'));
});

gulp.task('images', ['html'], function() {
	return es.merge(
		gulp.src(['./prod/img/**/*', '!./prod/img/**/*.gif'])
	        .pipe(imagemin({
	        	progressive: true,
	        	svgoPlugins: [{
	        		removeViewBox: false
	        	},
	        	{
	        		cleanupIDs: false
	        	},
	        	{
	        		collapseGroups: false
	        	},
	     		{
	     			convertShapeToPath: false
	     		}]
	        }))
	        .pipe(chmod(755))
	        .pipe(gulp.dest('./dist/img')),
		gulp.src('./prod/img/**/*.gif')
			.pipe(chmod(755))
			.pipe(gulp.dest('./dist/img')),
		gulp.src(['./prod/*.png', './prod/*.jpg'])
	        .pipe(imagemin({
	        	progressive: true
	        }))
	        .pipe(chmod(755))
	        .pipe(gulp.dest('./dist')),
		gulp.src('./prod/*.ico')
			.pipe(chmod(755))
			.pipe(gulp.dest('./dist'))
	);
});


// Watching files for changes before reloading
gulp.task('watch-img', function() {
	gulp.src('./prod/img/**/*')
	    .pipe(browserSync.reload({
	    	stream: true
	    }));
});

gulp.task('watch-js', function() {
	gulp.src('./prod/**/*.js')
	    .pipe(browserSync.reload({
	    	stream: true,
	    	once: true
	    }));
});

gulp.task('watch-html', function() {
	gulp.src('./prod/**/*.html')
	    .pipe(browserSync.reload({
	    	stream: true,
	    	once: true
	    }));
});




// Default functionality includes server with browser sync and watching
gulp.task('default', ['serve', 'sass'], function(){
	gulp.watch('./prod/sass/**/*.scss', ['sass']);
	gulp.watch('./prod/img/**/*', ['watch-img']);
	gulp.watch('./prod/js/**/*.js', ['watch-js']);
	gulp.watch('./prod/**/*.html', ['watch-html']);
});

// Build functionality with cleaning, moving, compiling, etc.
gulp.task('build', ['remove'], function(){
	return gulp.start(
	    'minify',
		'uglify',
		'html',
		'images'
	);
});




// Deployment to server
gulp.task('deploy', function() {
	rsync({
		ssh: true,
		src: 'dist/',
		dest: '162.243.216.48:/var/www/thisweeksplaylist.co/public_html',
		recursive: true,
		syncDest: true,
		args: ['--verbose --progress'],
		exclude: ['.DS_Store']
	}, function(error, stdout, stderr, cmd) {
		gutil.log(stdout);
	});
});
