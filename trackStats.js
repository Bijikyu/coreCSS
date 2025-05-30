function trackStats(){
  console.log(`trackStats is running with core.min.css`); // log start with file target
  try {
    const fs = require('fs'); // filesystem access for file size
    const path = require('path'); // path helpers for cross-platform
    const statsPath = path.join(__dirname, 'build-stats.json'); // file path for stats log
    const cssPath = path.join(__dirname, 'core.min.css'); // file path for css
    const size = fs.statSync(cssPath).size; // get file size in bytes
    let logData = []; // holds previous stats if present
    if(fs.existsSync(statsPath)){ logData = JSON.parse(fs.readFileSync(statsPath, 'utf-8')); } // load existing log
    const last = logData[logData.length - 1]; // check last recorded entry
    if(!last || last.size !== size){ // append if size changed
      logData.push({ date: new Date().toISOString(), size });
      fs.writeFileSync(statsPath, JSON.stringify(logData, null, 2)); // write updated log
    }
    console.log(`trackStats is returning ${size}`); // show file size tracked
  }catch(err){ console.error(err); }
}
trackStats(); // execute function when run
