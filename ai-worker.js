importScripts('engine.js');
onmessage = function(event) {
  const {state,depth,id}=event.data;
  try { postMessage({id,...Lumen.choose(state,depth)}); }
  catch(error) { postMessage({id,error:String(error.message)}); }
};
