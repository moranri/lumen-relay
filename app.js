'use strict';
const $=id=>document.getElementById(id);
let seed=3500,state=Lumen.create(seed),history=[],journal=[],generation=0,worker=null,busy=false;
function coordinate(i){return String.fromCharCode(65+i%5)+(1+Math.floor(i/5));}
function stopAI(){generation++;if(worker)worker.terminate();worker=null;busy=false;}
function render(){
  const moves=state.turn===0&&!state.over&&!busy?Lumen.legal(state):[];
  $('board').replaceChildren();
  state.values.forEach((value,i)=>{
    const owner=state.positions.indexOf(i),button=document.createElement('button');
    button.className='tile'+(state.blocked[i]?' sealed':'')+(moves.includes(i)?' legal':'')+(i===12&&!state.blocked[i]&&owner<0?' core':'')+(owner>=0?' p'+owner:'')+(state.last?.player===1&&state.last.target===i?' last':'');
    const name=owner===0?'your token':owner===1?'ORBIT token':state.blocked[i]?'sealed':`${value} energy`;
    button.setAttribute('aria-label',`${coordinate(i)}, ${name}${moves.includes(i)?', legal move':''}`);
    button.disabled=!moves.includes(i);
    const label=document.createElement('small');label.textContent=coordinate(i);button.append(label);
    const content=document.createElement('span');content.textContent=owner===0?'●':owner===1?'◇':state.blocked[i]?'×':i===12?'✦ '+value:String(value);button.append(content);
    button.addEventListener('click',()=>play(i));$('board').append(button);
  });
  $('you-score').textContent=state.scores[0];$('ai-score').textContent=state.scores[1];
  $('move-count').textContent='MOVE '+String(state.moves).padStart(2,'0');$('seed-label').textContent='GRID '+seed;
  $('undo').disabled=history.length===0;
  $('journal').replaceChildren();
  for(const line of journal){const li=document.createElement('li');li.textContent=line;$('journal').append(li);}
  if(!journal.length){const li=document.createElement('li');li.textContent='A symmetrical grid gives both players equal starting resources.';$('journal').append(li);}
  if(state.over){const winner=Lumen.winner(state);$('turn-title').textContent=winner===0?'You won.':winner===1?'ORBIT wins.':'A perfect tie.';$('phase').textContent='MATCH COMPLETE';$('message').textContent=`Both players are trapped. Final energy: you ${state.scores[0]}, ORBIT ${state.scores[1]}. Start a rematch to play again.`;}
  else{$('phase').textContent=busy?'AI THINKING':'LIVE';$('turn-title').textContent=state.turn===0?'Your move.':'ORBIT is thinking.';$('message').textContent=state.turn===0?'Select a glowing outlined tile. Move 1 or 2 spaces in a straight line.':'ORBIT is comparing your possible replies. You can still undo or start a new match.';}
}
function commit(target){const player=state.turn,gain=state.values[target];state=Lumen.apply(state,target);journal.push(`${player===0?'You':'ORBIT'} → ${coordinate(target)} · +${gain} energy`);if(!state.over&&state.turn===player)journal.push(`${player===0?'ORBIT':'You'} has no legal move; turn skipped.`);render();}
function play(target){if(busy||state.over||state.turn!==0||!Lumen.legal(state).includes(target))return;history.push({state:Lumen.clone(state),journal:[...journal],reason:$('ai-reason').textContent});commit(target);if(state.turn===1&&!state.over)runAI();}
function runAI(){
  if(state.over||state.turn!==1)return;
  busy=true;render();const id=++generation,depth=Number($('difficulty').value);
  const finish=result=>{if(id!==generation)return;if(worker)worker.terminate();worker=null;busy=false;
    if(result.error||!Lumen.legal(state).includes(result.target)){result=Lumen.choose(state,1);$('ai-reason').textContent='Worker unavailable. Using the local 1-ply strategy AI. '+result.reason;}else $('ai-reason').textContent=result.reason;
    commit(result.target);if(state.turn===1&&!state.over)runAI();
  };
  try{worker=new Worker('ai-worker.js');worker.onmessage=event=>finish(event.data);worker.onerror=()=>finish({error:true});worker.postMessage({state,depth,id});}
  catch(error){setTimeout(()=>finish({...Lumen.choose(state,depth)}),80);}
}
function start(same=false){stopAI();if(!same)seed=1+Math.floor(Math.random()*999999);state=Lumen.create(seed,Number($('first').value));history=[];journal=[];$('ai-reason').textContent='I evaluate energy, mobility, and your possible replies. This grid is symmetrical; the center core is worth 8.';render();if(state.turn===1)runAI();}
$('new-game').addEventListener('click',()=>start());$('rematch').addEventListener('click',()=>start(true));
$('undo').addEventListener('click',()=>{if(!history.length)return;stopAI();const previous=history.pop();state=previous.state;journal=previous.journal;$('ai-reason').textContent=previous.reason;render();});
render();
