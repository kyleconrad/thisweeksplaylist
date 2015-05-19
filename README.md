## Local Setup
Running local set up will install all necessary bundles and dependencies and then run a server with BrowserSync. It watches all SASS, JS, and images, then compiles and reloads accordingly.
    
    $ npm install -g gulp
    $ cd thisweeksplaylist
    $ npm install
    $ bundle install
    $ gulp

## Building
Building will remove all files from the 'dist' directory, compile and minify all SASS/CSS, concat and uglify all JS, minify all images, and process and copy all HTML. This will result with the entire site ready in the 'dist' directory upon completion.

    $ cd thisweeksplaylist
    $ gulp build

## Deploying
Deployment uses rsync to ensure that the live server is synced with the latest files from the 'dist' directory. Ensure that the latest updates have been built before attempting to deploy.

    $ cd thisweeksplaylist
    $ gulp build
    $ gulp deploy