(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Lumen = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const SIZE = 5;
  function create(seed = 3500, first = 0) {
    let x = Number(seed) >>> 0;
    const values = Array(25).fill(0);
    for (let i = 0; i < 13; i++) {
      x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
      values[i] = values[24-i] = 1 + (x % 5);
    }
    values[0] = values[24] = 0; values[12] = 8;
    return { values, blocked: Array(25).fill(false), positions: [0,24], scores:[0,0], turn:first, moves:0, over:false, last:null };
  }
  function clone(s) { return { ...s, values:[...s.values], blocked:[...s.blocked], positions:[...s.positions], scores:[...s.scores] }; }
  function legal(s, player = s.turn) {
    if(s.over) return [];
    const start = s.positions[player], row=Math.floor(start/SIZE), col=start%SIZE, out=[];
    for(const [dr,dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      for(let steps=1;steps<=2;steps++) {
        const r=row+dr*steps,c=col+dc*steps, index=r*SIZE+c;
        if(r<0||r>=SIZE||c<0||c>=SIZE||s.blocked[index]||s.positions.includes(index)) break;
        out.push(index);
      }
    }
    return out;
  }
  function apply(s, target) {
    if(!Number.isInteger(target)||!legal(s).includes(target)) throw new Error('Illegal move');
    const n=clone(s), player=s.turn, gain=n.values[target];
    n.blocked[n.positions[player]]=true;
    n.positions[player]=target; n.scores[player]+=gain; n.values[target]=0; n.moves++;
    n.last={player,target,gain};
    n.turn=1-player;
    if(!legal(n,n.turn).length) {
      n.turn=player;
      if(!legal(n,player).length) n.over=true;
    }
    return n;
  }
  function winner(s) { return s.over ? (s.scores[0]===s.scores[1] ? -1 : s.scores[0]>s.scores[1] ? 0:1) : null; }
  function evaluate(s, player) {
    const score=s.scores[player]-s.scores[1-player];
    if(s.over) return score===0 ? 0 : Math.sign(score)*10000+score;
    const a=legal(s,player), b=legal(s,1-player);
    return score*12+(a.length-b.length)*2 + (Math.max(0,...a.map(i=>s.values[i]))-Math.max(0,...b.map(i=>s.values[i])));
  }
  function choose(s, depth=3, budget=40000) {
    const player=s.turn, moves=legal(s);
    if(!moves.length) return { target:null,nodes:0,depth:0,reason:'No legal moves.' };
    let nodes=0;
    function search(state, remaining, alpha,beta) {
      nodes++;
      if(state.over||remaining===0||nodes>=budget) return evaluate(state,player);
      const max=state.turn===player;
      let best=max ? -Infinity:Infinity;
      const ordered=legal(state).sort((a,b)=>state.values[b]-state.values[a]);
      for(const target of ordered) {
        const val=search(apply(state,target),remaining-1,alpha,beta);
        best=max ? Math.max(best,val):Math.min(best,val);
        if(max) alpha=Math.max(alpha,best); else beta=Math.min(beta,best);
        if(beta<=alpha||nodes>=budget) break;
      }
      return best;
    }
    let target=moves[0], best=-Infinity;
    const requested=Math.max(1,Math.min(5,Math.trunc(depth)||1));
    for(const move of moves.sort((a,b)=>s.values[b]-s.values[a])) {
      const value=search(apply(s,move),requested-1,-Infinity,Infinity);
      if(value>best) {best=value;target=move;}
    }
    const next=apply(s,target), mobility=legal(next,player).length;
    const coord=String.fromCharCode(65+target%5)+(1+Math.floor(target/5));
    return { target,nodes,depth:requested,reason:`${coord} collects ${s.values[target]} energy and leaves ${mobility} next-move options. I searched up to ${requested} plies (${nodes.toLocaleString()} positions).` };
  }
  return { SIZE,create,clone,legal,apply,winner,evaluate,choose };
});
