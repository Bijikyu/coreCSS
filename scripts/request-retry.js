const axios = require('axios'); //imports axios for HTTP requests
const qerrors = require('qerrors'); //imports qerrors for error logging

function wait(ms){ //pauses execution for ms milliseconds
 console.log(`wait is running with ${ms}`); //logs wait start
 return new Promise(res=>setTimeout(()=>{console.log(`wait is returning undefined`);res();},ms)); //resolves after delay
}

async function fetchRetry(url,opts={},attempts=3){ //performs axios.get with retries
 console.log(`fetchRetry is running with ${url},${attempts}`); //logs function start
 for(let i=1;i<=attempts;i++){ //loops over retry attempts
  try{
   const res=await axios.get(url,opts); //sends request to url
   console.log(`fetchRetry is returning ${res.status}`); //logs success status
   return res; //returns axios response
  }catch(err){
   qerrors(err,`fetch attempt ${i}`,{url,attempt:i}); //logs failed attempt
   if(i===attempts){ //checks if final attempt reached
    throw err; //rethrows error after final failure
   }
   const delay=2**(i-1)*100; //calculates exponential backoff delay
   await wait(delay); //waits before next attempt
  }
 }
}

module.exports=fetchRetry; //exports fetchRetry utility
