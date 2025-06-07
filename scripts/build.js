const {execFile} = require('child_process'); //provides async shell commands
const {promisify} = require('util'); //imports promisify utility
const fs = require('fs').promises; //file system for reading css using promises
const crypto = require('crypto'); //crypto for hashing
const {gzip, brotliCompress} = require('zlib').promises; //imports async compression functions
const qerrors = require('qerrors'); //error logger
const execFileAsync = promisify(execFile); //promisifies execFile for promise-based execution

async function build(){ //runs postcss then renames file to hashed version asynchronously
 console.log(`build is running with ${process.argv.length}`); //log start
 try {
  await execFileAsync('npx', ['postcss','core.css','-o','core.min.css']); //run postcss asynchronously
  const data = await fs.readFile('core.min.css'); //read built css asynchronously
  const hash = crypto.createHash('sha1').update(data).digest('hex').slice(0,8); //compute sha1 hash

  const files = (await fs.readdir('.')).filter(f => /^core\.[a-f0-9]{8}\.min\.css$/.test(f) && f !== `core.${hash}.min.css`); //list old hashed css asynchronously
  await Promise.all(files.map(f => fs.unlink(f))); //delete old hashes asynchronously
  const compressedOld = (await fs.readdir('.')).filter(f => /^core\.[a-f0-9]{8}\.min\.css\.(?:gz|br)$/.test(f) && !f.includes(hash)); //list old compressed files asynchronously
  await Promise.all(compressedOld.map(f => fs.unlink(f))); //delete old compressed asynchronously
  await fs.rename('core.min.css', `core.${hash}.min.css`); //rename with hash asynchronously

  const gzData = await gzip(data); //await gzip to prevent blocking
  await fs.writeFile(`core.${hash}.min.css.gz`, gzData); //write gzip data after async compress
  const brData = await brotliCompress(data); //await brotli for same reason
  await fs.writeFile(`core.${hash}.min.css.br`, brData); //write brotli data after async compress

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
