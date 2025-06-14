function get(name){
  console.log(`envVar.get is running with ${name}`); // logs entry for debugging
  let val = process.env[name]; // read env
  return {
    default(defaultVal){ if(val===undefined||val===''){ val = defaultVal; } return this; },
    asString(){ console.log(`envVar.get.asString is returning ${val}`); return val; },
    asIntPositive(){ const num = parseInt(val,10); if(Number.isNaN(num)||num<=0){ throw new Error(`Invalid positive int for ${name}`); } console.log(`envVar.get.asIntPositive is returning ${num}`); return num; },
    asBool(){ const lowered = String(val).toLowerCase(); const truthy=['true','1','yes','y','on','t']; const falsy=['false','0','no','n','off','f']; if(truthy.includes(lowered)){ console.log(`envVar.get.asBool is returning true`); return true; } if(falsy.includes(lowered)){ console.log(`envVar.get.asBool is returning false`); return false; } throw new Error(`Invalid boolean for ${name}`); }
  };
}
module.exports = {get};
