const envVar = require('env-var'); // env-var provides robust env parsing

function parseEnvInt(name, def, min = 1, max = 1000){
  console.log(`parseEnvInt is running with ${name},${def},${min},${max}`); // entry log
  try {
    const val = envVar.get(name).default(String(def)).asIntPositive(); // uses env-var for parsing
    if(val < min || val > max){ console.log(`parseEnvInt is returning ${def}`); return def; } // range enforcement
    console.log(`parseEnvInt is returning ${val}`); // validated
    return val; // return value
  } catch(err){
    console.log(`parseEnvInt is returning ${def}`); // error fallback
    return def; // fallback on error
  }
}

function parseEnvString(name, def){
  console.log(`parseEnvString is running with ${name},${def}`); // entry log
  try {
    const result = envVar.get(name).default(def).asString().trim(); // parse string and strip spaces
    console.log(`parseEnvString is returning ${result}`); // return value
    return result; // success path
  } catch(err){
    console.log(`parseEnvString is returning ${def}`); // fallback on error
    return def; // return default
  }
}

function parseEnvBool(name, def = false){
  console.log(`parseEnvBool is running with ${name},${def}`); // entry log
  try {
    const result = envVar.get(name).default(String(def)).asBool(); // parse bool
    console.log(`parseEnvBool is returning ${result}`); // return parsed
    return result; // success path
  } catch(err){
    console.log(`parseEnvBool is returning ${def}`); // fallback
    return def; // default on error
  }
}

function trimTrailingSlashes(str){
  console.log(`trimTrailingSlashes is running with ${str}`); // entry log
  try {
    const result = String(str).replace(/\/+$/, ''); // removes trailing slashes for consistent urls
    console.log(`trimTrailingSlashes is returning ${result}`); // normalized result
    return result; // success path
  } catch(err){
    console.log(`trimTrailingSlashes is returning ${str}`); // fallback on error
    return str; // return original if replacement fails
  }
}

module.exports = {parseEnvInt, parseEnvString, parseEnvBool, trimTrailingSlashes};
