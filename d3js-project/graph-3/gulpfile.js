var gulp = require('gulp');
var browserSync = require('browser-sync').create();
// var sass = require('gulp-sass');

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {

  browserSync.init({
    server: "./app"
  });

  // gulp.watch("app/scss/*.scss", ['sass']);
  // gulp.watch("app/*.html").on('change', browserSync.reload);
  gulp.watch(["app/**/*.html", "app/**/*.css", "app/**/*.js"]).on('change', function() {
  	browserSync.reload();
  });
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
  return;
  // return gulp.src("app/scss/*.scss")
  //     .pipe(sass())
  //     .pipe(gulp.dest("app/css"))
  //     .pipe(browserSync.stream());
});

gulp.task('default', ['serve']);