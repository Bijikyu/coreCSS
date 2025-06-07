const {execSync} = require('child_process'); //allows shell commands
const fs = require('fs').promises; //file system for reading css using promises
const crypto = require('crypto'); //crypto for hashing
const qerrors = require('qerrors'); //error logger

async function build(){ //runs postcss then renames file to hashed version asynchronously
 console.log(`build is running with ${process.argv.length}`); //log start
 try {
  execSync('npx postcss core.css -o core.min.css --cache'); //process css
  const data = await fs.readFile('core.min.css'); //read built css asynchronously
  const hash = crypto.createHash('sha1').update(data).digest('hex').slice(0,8); //compute sha1 hash

  const files = fs.readdirSync('.').filter(f => /^core\.[a-f0-9]{8}\.min\.css$/.test(f) && f !== `core.${hash}.min.css`); //list old hashed css
  files.forEach(f => fs.unlinkSync(f)); //delete old hashes
  await fs.renameSync('core.min.css', `core.${hash}.min.css`); //rename with hash

  console.log(`build has run resulting in core.${hash}.min.css`); //log result
  await fs.writeFile('build.hash', hash); //persist hash asynchronously
  console.log(`build is returning ${hash}`); //final log before return
  return hash; //return hash
 } catch(err){
  qerrors(err, 'build failed', {args:process.argv.slice(2)}); //log error
  throw err; //rethrow
 }
}

if(require.main === module){
 build().catch(err => { //handles async failure
  qerrors(err, 'build script failure', {args:process.argv.slice(2)}); //log context
  process.exitCode = 1; //set exit code on failure
 });
}

module.exports = build; //export function
