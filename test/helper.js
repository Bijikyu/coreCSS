const Module = require('module');
const path = require('node:path');
const orig = Module.prototype.require;
const axiosStub = {get: async ()=>({status:200})}; // reusable axios stub
const qerrorsStub = () => {}; // reusable qerrors stub
Module.prototype.require = function(id){
  if(id==='axios') return axiosStub; // returns same axios stub each require
  if(id==='qerrors') return qerrorsStub; // returns same qerrors stub
  if(id==='p-limit') return () => (fn) => async (...args)=> fn(...args); // simple p-limit stub
  return orig.call(this,id); // fallback to original require
};

const origResolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain, options){
  if(request === './qore.css') return path.resolve(__dirname,'../qore.css'); // provide absolute css path for qore.css
  if(request === './variables.css') return path.resolve(__dirname,'../variables.css'); // provide absolute variables path
  return origResolve.call(this, request, parent, isMain, options); // default behavior
};
