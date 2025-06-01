const axios = require('axios'); //imports axios for HTTP requests
const fs = require('fs'); //imports fs for reading hash file
const qerrors = require('qerrors'); //imports qerrors for error logging

async function purgeCdn(file){ //calls jsDelivr purge endpoint
 console.log(`purgeCdn is running with ${file}`); //logs function start
 try {
  const url = `https://purge.jsdelivr.net/gh/Bijikyu/coreCSS/${file}`; //builds purge url
  if(process.env.CODEX === `True`){ //mocks network request when offline
   console.log(`purgeCdn is returning 200`); //logs mocked result
   return 200; //returns mock status code
  }
  const res = await axios.get(url); //sends purge request
  console.log(`purgeCdn is returning ${res.status}`); //logs response status
  return res.status; //returns status code
 } catch(err){
  qerrors(err, `purgeCdn failed`, {file}); //logs error context
  throw err; //rethrows error
 }
}

async function run(){ //entry point executed when run directly
 console.log(`run is running with ${process.argv.length}`); //logs start
 try {
  const hash = fs.readFileSync(`build.hash`, `utf8`).trim(); //reads hash file
  const file = `core.${hash}.min.css`; //creates hashed file name
  const code = await purgeCdn(file); //calls purgeCdn
  console.log(`run is returning ${code}`); //logs return code
  return code; //returns status code
 } catch(err){
  qerrors(err, `run failed`, {args:process.argv.slice(2)}); //logs error context
  throw err; //rethrows error
 }
}

if(require.main === module){ //runs when executed directly
 run().catch(err => { //handles promise rejection and logs
  qerrors(err, `purge script failure`, {args:process.argv.slice(2)}); //logs error context
  process.exitCode = 1; //sets failure exit code
 });
}

module.exports = purgeCdn; //exports purgeCdn function
