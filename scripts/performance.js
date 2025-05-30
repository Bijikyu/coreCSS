const axios = require('axios'); //imports axios for HTTP requests
const {performance} = require('perf_hooks'); //imports performance for timing
const qerrors = require('qerrors'); //imports qerrors for error logging

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
   `https://cdn.jsdelivr.net/gh/Bijikyu/coreCSS/core.min.css`, //jsDelivr file url
   `https://bijikyu.github.io/coreCSS/core.min.css` //GitHub Pages file url
  ];
  const concurrency = parseInt(process.argv[2]) || 5; //concurrency parameter
  for(const url of urls){ //loops through urls
   const avg = await measureUrl(url, concurrency); //calls measureUrl
   console.log(`Average for ${url}: ${avg.toFixed(2)}ms`); //logs result
  }
  console.log(`run has run resulting in a final value of 0`); //logs end
 } catch(err){
  qerrors(err, `run failed`, {args:process.argv.slice(2)}); //logs error context
 }
}

if(require.main === module){ //runs if file is executed directly
 run(); //calls run
}

module.exports = {getTime, measureUrl}; //exports functions
