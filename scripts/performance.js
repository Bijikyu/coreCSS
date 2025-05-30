const axios = require('axios'); //imports axios for HTTP requests
const {performance} = require('perf_hooks'); //imports performance for timing
const qerrors = require('qerrors'); //imports qerrors for error logging
const fs = require('fs'); //imports fs for writing json results
const CDN_BASE_URL = process.env.CDN_BASE_URL || `https://cdn.jsdelivr.net`; //sets CDN from env var with default

function wait(ms){ //helper to wait for mock network delay
 console.log(`wait is running with ${ms}`); //logs start of wait
 return new Promise(res => setTimeout(()=>{console.log(`wait is returning undefined`);res();}, ms)); //returns after delay
}

async function getTime(url){ //measures single download time
 console.log(`getTime is running with ${url}`); //logs start
 const start = performance.now(); //records start time
 try {
  if(process.env.CODEX === `True`){ //checks if running in Codex
   await wait(100); //mocks network delay
  } else {
   await axios.get(url, {responseType: `arraybuffer`}); //makes real request
  }
  const time = performance.now() - start; //calculates elapsed
  console.log(`getTime is returning ${time}`); //logs return
  return time; //returns elapsed
 } catch(err){
  qerrors(err, `getTime failed`, {url}); //logs error context
  throw err; //rethrows error
 }
}

async function measureUrl(url, count){ //runs downloads concurrently
 console.log(`measureUrl is running with ${url},${count}`); //logs start
 try {
  const runs = Array.from({length: count}, ()=>getTime(url)); //creates array of promises
  const times = await Promise.all(runs); //awaits all downloads
  const avg = times.reduce((a,b)=>a+b,0)/count; //calculates average
  console.log(`measureUrl is returning ${avg}`); //logs return
  return avg; //returns average
 } catch(err){
  qerrors(err, `measureUrl failed`, {url,count}); //logs error context
  throw err; //rethrows error
 }
}

async function run(){ //entry point for script
 console.log(`run is running with ${process.argv.length}`); //logs start
 try {
  const urls = [
   `${CDN_BASE_URL}/gh/Bijikyu/coreCSS/core.77526ae8.min.css`, //jsDelivr file url built from env var
   `https://bijikyu.github.io/coreCSS/core.77526ae8.min.css` //GitHub Pages file url with hash
  ];
  const args = process.argv.slice(2); //collects cli args
  const jsonFlag = args.includes(`--json`); //checks for json output flag
  if(jsonFlag){ args.splice(args.indexOf(`--json`),1); } //removes flag from args
  const concurrency = parseInt(args[0]) || 5; //concurrency parameter
  const results = {}; //object to store averages
  for(const url of urls){ //loops through urls
   const avg = await measureUrl(url, concurrency); //calls measureUrl
   console.log(`Average for ${url}: ${avg.toFixed(2)}ms`); //logs result
   if(jsonFlag){ results[url] = avg; } //saves result if json requested
  }
  if(jsonFlag){ fs.writeFileSync(`performance-results.json`, JSON.stringify(results, null, 2)); } //writes file when flag present
  console.log(`run has run resulting in a final value of 0`); //logs end
 } catch(err){
  qerrors(err, `run failed`, {args:process.argv.slice(2)}); //logs error context
 }
}

if(require.main === module){ //runs if file is executed directly
 run(); //calls run
}

module.exports = {getTime, measureUrl}; //exports functions
