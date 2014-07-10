var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var npmi = require('npmi');

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
  mkdirp('themes', function(err){ // Create a themes folder
    if (err) 
      callback(err);
    else {
      downloadTheme(theme,version,function(){})
    }
  })
};

function downloadTheme(theme,version,callback){
  options = {
    name : theme,
    version : version,
    path : './themes',
    npmLoad : {
      loglevel : 'silent'
    }
  }

  npmi(options, function(err,result){
    if (err) {
      if (err.code === npmi.LOAD_ERR) callack(err);
      else if (err.code === npmi.INSTALL_ERR) callback(err);
    }
    else { // The theme was sucessfully downloaded 
      console.log(options.name+'@'+options.version+' installed successfully in '+path.resolve(options.path));
      callback(null,path.join(options.path,'node_modules',options.name)); // Calls the callback with the full path to the theme
    }
  });
};

function runTheme(resumeObject,themeDirectory,callback){
  var theme = require(path.join(__dirname,themeDirectory));
  if (theme.render) {
    var html = theme.render(resumeObject);
    callback(null,html);
  }
  else {
    console.log("Error with the module");
    callback('error with the module');
  }
};

module.exports = resumeToHTML;

downloadTheme('jsonresume-theme-light','0',function(err,themeDirectory){
  if (err) console.log("ERROR");
  else {
    console.log("OK")
    runTheme(resumeObject,themeDirectory,function(err,html){
      console.log(html)
    })
  }
})
