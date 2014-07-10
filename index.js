var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var themeDir = 'themes';

var resumeObject = JSON.parse(fs.readFileSync('resume.json','utf8'));
var options = {
  theme : 'modern'
}

function resumeToHTML(resumeObject, options, callback) { // Callback (filename)

  var theme = 'jsonresume-theme-' + options.theme
  var version = '0';

  var versionCheck = theme.split('@');

  if (versionCheck.length > 1) {
    theme = versionCheck[0];
    version = versionCheck[1];
  }

  var directoryFolder = path.join(themeDir, theme, version);
  console.log(directoryFolder);
  fs.exists(directoryFolder,function(exists){
    if (exists){ // If the theme exists, there is no need to download it

    } else { // Download the theme
      // But first, create the folder
      mkdirp(directoryFolder,function(err){
        if (err) // If an error happened while creating the folder
          callback(err);
        else { // The folders were created, now proceed to download

        }
      })
    }
  })


}

function downloadTheme(options,callback){};

function runTheme(options,callback){};


function runTheme(options, req, res) {
  var themeDirectory = options.themeDirectory;
  var theme = require(__dirname + '/' + themeDirectory);
  if (theme.render) {
    res.send(theme.render(options.resume));
  } else {
    res.send('Theme error!')
  }
};

var getTheme = function(req, res) {

  if(req.body && req.body.resume) {
    console.log('USE POSTED RESUME');

    resume = req.body.resume;
  }
  var theme = 'jsonresume-theme-' + req.params.theme;
  var version = '0';
  var versionCheck = theme.split('@');
  if (versionCheck.length > 1) {
    theme = versionCheck[0];
    version = versionCheck[1];
  }

  var directoryFolder = path.join(themeDir, theme, version);

  console.log(theme, version);
  console.log('why ont execute');
  fs.exists(directoryFolder, function(exists) {
    console.log(directoryFolder, exists);
    if (exists && version !== '0') {
      console.log('Theme cached');
      runTheme({
        themeDirectory: directoryFolder,
        resume: resume
      }, req, res);
      return;
    } else {
      console.log('Chceking NPM');
      request.get('https://registry.npmjs.org/' + theme, function(response) {

        var lib = response.body;
        if (version === '0') {
          version = lib['dist-tags'].latest;
        }

        var directoryFolder = path.join(themeDir, theme, version);
        fs.exists(directoryFolder, function(exists) {
          if (exists) {
            runTheme({
              themeDirectory: directoryFolder,
              resume: resume
            }, req, res);
            return;
          } else {
            console.log(directoryFolder);
            var tarballURL = lib.versions[version].dist.tarball;
            console.log(tarballURL);
            var themeVersion = theme + '@' + version;

            mkdirp(directoryFolder, function(err) {
              var tempExtractPath = __dirname + '/tmp/' + themeVersion;
              console.log('Downloading NPM module');
              tarball.extractTarballDownload(tarballURL, __dirname + '/tmp/' + themeVersion + '.tar.gz', tempExtractPath, {}, function(err, result) {
                fs.readdir(tempExtractPath, function(err, files) {
                  var containingFolder = files[0];
                  fs.rename(path.join(tempExtractPath, containingFolder), directoryFolder, function() {
                    console.log('Installing dependencies');
                    child = exec('cd ' + directoryFolder + ' && npm install',
                      function(error, stdout, stderr) {

                        runTheme({
                          themeDirectory: directoryFolder,
                          resume: resume
                        }, req, res);
                        if (error !== null) {
                          console.log('exec error: ' + error);
                        }
                      });
                  });
                })
              })
            });
          }
        });

      });
      // Do something
    }

  });
};

module.exports = resumeToHTML;

resumeToHTML(resumeObject,options, function(){
  console.log("SWOOP");
})
