const fs = require('fs').promises; //imports fs for reading and writing files with promises
const qerrors = require('qerrors'); //imports error logger

async function updateHtml(){ //updates index.html with new css hash asynchronously
 console.log(`updateHtml is running with ${process.argv.length}`); //logs function start
 try {
  const hash = (await fs.readFile('build.hash','utf8')).trim(); //reads hash asynchronously from build.hash
  const html = await fs.readFile('index.html','utf8'); //reads index.html content asynchronously
  const updated = html.replace(/core\.[a-f0-9]{8}\.min\.css/g, `core.${hash}.min.css`); //replaces old hash
  await fs.writeFile('index.html', updated); //writes modified html back asynchronously
  console.log(`updateHtml has run resulting in core.${hash}.min.css`); //logs result of update
  console.log(`updateHtml is returning ${hash}`); //logs return value
  return hash; //returns new hash
 } catch(err){
  qerrors(err, 'updateHtml failed', {args:process.argv.slice(2)}); //logs error context
  throw err; //rethrows error for caller
 }
}

if(require.main === module){ //runs when called directly
 updateHtml().catch(err => { //handles async failure
  qerrors(err, 'updateHtml script failure', {args:process.argv.slice(2)}); //log error context
  process.exitCode = 1; //set failure exit code
 });
}

module.exports = updateHtml; //exports function
