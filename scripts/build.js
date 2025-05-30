const {execSync} = require('child_process'); //allows shell commands
const fs = require('fs'); //file system for reading css
const crypto = require('crypto'); //crypto for hashing
const qerrors = require('qerrors'); //error logger

function build(){ //runs postcss then renames file to hashed version
 console.log(`build is running with ${process.argv.length}`); //log start
 try {
  execSync('npx postcss core.css -o core.min.css --cache'); //process css
  const data = fs.readFileSync('core.min.css'); //read built css
  const hash = crypto.createHash('sha1').update(data).digest('hex').slice(0,8); //compute sha1 hash
  fs.renameSync('core.min.css', `core.${hash}.min.css`); //rename with hash
  console.log(`build has run resulting in core.${hash}.min.css`); //log result
  const shaData = fs.readFileSync(`core.${hash}.min.css`); //read renamed css
  const sri = crypto.createHash('sha384').update(shaData).digest('base64'); //calc sha384
  let html = fs.readFileSync('index.html', 'utf8'); //read index
  html = html.replace(/core\.[a-f0-9]{8}\.min\.css/g, `core.${hash}.min.css`); //update hash
  html = html.replace(/<link id="cdnCSS"[^>]+>/,
   `<link id="cdnCSS" rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/Bijikyu/coreCSS/core.${hash}.min.css" integrity="sha384-${sri}" crossorigin="anonymous" onerror="this.onerror=null;this.href='core.${hash}.min.css'">`); //replace cdn link
  const logoData = fs.readFileSync('core.png'); //read local logo
  const logoSri = crypto.createHash('sha384').update(logoData).digest('base64'); //calc logo sha
  html = html.replace(/<link rel="icon"[^>]+>/,
   `<link rel="icon" type="image/png" href="https://cdn.jsdelivr.net/gh/Bijikyu/staticAssetsSmall/logos/core-logo-min.png" integrity="sha384-${logoSri}" crossorigin="anonymous" onerror="this.onerror=null;this.href='core.png'"/>`); //replace favicon
  html = html.replace(/<img([^>]+src="https:\/\/cdn\.jsdelivr\.net\/gh\/Bijikyu\/staticAssetsSmall\/logos\/core-logo-min.png"[^>]*)\/>/g,
   `<img$1 integrity="sha384-${logoSri}" crossorigin="anonymous"/>`); //add sri to logos
  fs.writeFileSync('index.html', html); //write updated html
  fs.writeFileSync('build.hash', hash); //persist hash
  console.log(`build is returning ${hash}`); //final log before return
  return hash; //return hash
 } catch(err){
  qerrors(err, 'build failed', {args:process.argv.slice(2)}); //log error
  throw err; //rethrow
 }
}

if(require.main === module){
 build(); //run if executed
}

module.exports = build; //export function
