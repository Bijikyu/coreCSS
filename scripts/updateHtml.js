const fs = require('fs'); //imports fs for reading and writing files
const qerrors = require('qerrors'); //imports error logger

function updateHtml(){ //updates index.html with new css hash
 console.log(`updateHtml is running with ${process.argv.length}`); //logs function start
 try {
  const hash = fs.readFileSync('build.hash','utf8').trim(); //reads hash from build.hash
  const html = fs.readFileSync('index.html','utf8'); //reads index.html content
  const updated = html.replace(/core\.[a-f0-9]{8}\.min\.css/g, `core.${hash}.min.css`); //replaces old hash
  fs.writeFileSync('index.html', updated); //writes modified html back
  console.log(`updateHtml has run resulting in core.${hash}.min.css`); //logs result of update
  console.log(`updateHtml is returning ${hash}`); //logs return value
  return hash; //returns new hash
 } catch(err){
  qerrors(err, 'updateHtml failed', {args:process.argv.slice(2)}); //logs error context
  throw err; //rethrows error for caller
 }
}

if(require.main === module){ //runs when called directly
 updateHtml(); //invokes update
}

module.exports = updateHtml; //exports function
