"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Step = { x: number; y: number; w: number; drift: number; phase: number };
const W = 420, H = 720;

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const keys = useRef({ left: false, right: false });
  const [meters, setMeters] = useState(0);
  const [best, setBest] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => setBest(Number(localStorage.getItem("scrolling-king-best") || 0)), []);

  const start = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    const canvas = canvasRef.current, ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    setMeters(0); setRunning(true);

    const king = { x: 192, y: 585, vx: 0, vy: -11.5, w: 36, h: 48 };
    let camera = 0, topMeters = 0, last = performance.now(), nextY = H - 70;
    const steps: Step[] = [{ x: 125, y: H - 70, w: 170, drift: 0, phase: 0 }];

    const addSteps = () => {
      while (nextY > -camera - 900) {
        nextY -= 78 + Math.random() * 28;
        const altitude = Math.max(0, -nextY / 10);
        const w = Math.max(68, 125 - altitude * .06 + Math.random() * 35);
        steps.push({ x: 14 + Math.random() * (W - w - 28), y: nextY, w, drift: altitude > 70 && Math.random() < .28 ? 25 + Math.random() * 24 : 0, phase: Math.random() * 6 });
      }
    };
    addSteps();

    const round = (x:number,y:number,w:number,h:number,r:number) => { ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fill(); };
    const finish = () => {
      const finalMeters = Math.floor(topMeters);
      setRunning(false);
      setBest(old => { const value = Math.max(old, finalMeters); localStorage.setItem("scrolling-king-best", String(value)); return value; });
    };

    const loop = (now:number) => {
      const dt = Math.min(1.7, (now-last)/16.67); last = now;
      const direction = Number(keys.current.right) - Number(keys.current.left);
      king.vx = (king.vx + direction * .7 * dt) * Math.pow(.82, dt);
      king.vx = Math.max(-7, Math.min(7, king.vx));
      const oldBottom = king.y + king.h;
      king.vy += .48 * dt; king.x += king.vx * dt; king.y += king.vy * dt;
      if (king.x < -king.w) king.x = W; if (king.x > W) king.x = -king.w;

      for (const s of steps) {
        const sx = s.x + Math.sin(now/800+s.phase)*s.drift, sy = s.y + camera;
        if (king.vy > 0 && oldBottom <= sy+5 && king.y+king.h >= sy && king.x+king.w > sx && king.x < sx+s.w) {
          king.y = sy-king.h; king.vy = -11.7;
        }
      }

      if (king.y < 285) { const rise = 285-king.y; king.y=285; camera += rise; }
      topMeters = Math.max(topMeters, camera/10);
      setMeters(Math.floor(topMeters)); addSteps();
      while (steps.length && steps[0].y+camera > H+100) steps.shift();

      const level = Math.min(1, topMeters/600);
      const sky = ctx.createLinearGradient(0,0,0,H);
      sky.addColorStop(0, level < .45 ? "#102b55" : "#061326"); sky.addColorStop(1, level < .45 ? "#80c9df" : "#6552a0");
      ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
      ctx.fillStyle="rgba(255,255,255,.75)";
      for(let i=0;i<40;i++){const x=(i*79)%W,y=((i*121+camera*.14)%H+H)%H;ctx.fillRect(x,y,i%7?1.5:3,i%7?1.5:3)}
      ctx.fillStyle="rgba(255,255,255,.15)";
      for(let i=0;i<5;i++){const y=((i*190+camera*.38)%950)-120;ctx.beginPath();ctx.ellipse((i*113)%W,y,75,22,0,0,Math.PI*2);ctx.fill()}

      ctx.textAlign="center"; ctx.fillStyle="rgba(255,255,255,.94)"; ctx.font="900 54px Arial"; ctx.fillText(`${Math.floor(topMeters)}m`,W/2,82);
      ctx.font="700 10px Arial"; ctx.letterSpacing="3px"; ctx.fillStyle="rgba(255,255,255,.65)"; ctx.fillText("ALTITUDE",W/2,103); ctx.letterSpacing="0px";
      const nextMark=(Math.floor(topMeters/100)+1)*100, markY=285-(nextMark-topMeters)*10;
      if(markY>-20&&markY<H){ctx.strokeStyle="rgba(255,255,255,.25)";ctx.setLineDash([5,7]);ctx.beginPath();ctx.moveTo(0,markY);ctx.lineTo(W,markY);ctx.stroke();ctx.setLineDash([]);ctx.textAlign="right";ctx.font="bold 12px Arial";ctx.fillText(`${nextMark}m`,W-12,markY-8)}

      for(const s of steps){const sy=s.y+camera;if(sy<-25||sy>H+25)continue;const sx=s.x+Math.sin(now/800+s.phase)*s.drift;ctx.fillStyle="#17223b";round(sx+4,sy+8,s.w,17,8);ctx.fillStyle=s.drift?"#ff8068":"#f2c14f";round(sx,sy,s.w,13,7);ctx.fillStyle="rgba(255,255,255,.45)";round(sx+7,sy+2,s.w*.48,3,2)}

      const x=king.x,y=king.y;ctx.fillStyle="rgba(5,10,25,.25)";ctx.beginPath();ctx.ellipse(x+18,y+51,22,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#ffdbad";ctx.beginPath();ctx.arc(x+18,y+17,12,0,Math.PI*2);ctx.fill();ctx.fillStyle="#673c8a";round(x+3,y+27,30,22,7);ctx.fillStyle="#ffd04d";ctx.beginPath();ctx.moveTo(x+5,y+8);ctx.lineTo(x+9,y-5);ctx.lineTo(x+18,y+4);ctx.lineTo(x+26,y-7);ctx.lineTo(x+31,y+8);ctx.closePath();ctx.fill();ctx.fillStyle="#251532";ctx.beginPath();ctx.arc(x+14,y+16,1.7,0,Math.PI*2);ctx.arc(x+23,y+16,1.7,0,Math.PI*2);ctx.fill();

      if(king.y>H+60){finish();return} frameRef.current=requestAnimationFrame(loop);
    };
    frameRef.current=requestAnimationFrame(loop);
  },[]);

  useEffect(()=>{const down=(e:KeyboardEvent)=>{if(["ArrowLeft","a","A"].includes(e.key))keys.current.left=true;if(["ArrowRight","d","D"].includes(e.key))keys.current.right=true;if(!running&&[" ","Enter"].includes(e.key))start()};const up=(e:KeyboardEvent)=>{if(["ArrowLeft","a","A"].includes(e.key))keys.current.left=false;if(["ArrowRight","d","D"].includes(e.key))keys.current.right=false};window.addEventListener("keydown",down);window.addEventListener("keyup",up);return()=>{window.removeEventListener("keydown",down);window.removeEventListener("keyup",up);cancelAnimationFrame(frameRef.current)}},[running,start]);
  const press=(side:"left"|"right",value:boolean)=>{keys.current[side]=value};

  return <main>
    <section className="game-shell">
      <header><div><span className="eyebrow">ENDLESS CLIMB</span><h1>SCROLLING <i>KING</i></h1></div><div className="crest">♛</div></header>
      <div className="stats"><div><small>HEIGHT</small><strong>{meters} m</strong></div><div><small>BEST</small><strong>{best} m</strong></div></div>
      <div className="stage"><canvas ref={canvasRef} width={W} height={H} aria-label="王様が上を目指すゲーム"/>{!running&&<div className="overlay"><div className="mini-crown">♛</div><h2>{meters?`${meters}m 到達！`:"どこまで登れる？"}</h2><p>足場をつないで、ひたすら上へ。<br/>高度の限界に挑戦しよう。</p><button onClick={start}>{meters?"もう一度登る":"登りはじめる"}</button></div>}</div>
      <div className="controls"><button aria-label="左へ" onPointerDown={()=>press("left",true)} onPointerUp={()=>press("left",false)} onPointerLeave={()=>press("left",false)}>←</button><p><b>MOVE</b><span>矢印 / A・D</span></p><button aria-label="右へ" onPointerDown={()=>press("right",true)} onPointerUp={()=>press("right",false)} onPointerLeave={()=>press("right",false)}>→</button></div>
    </section>
    <aside><span>ONLY ONE GOAL</span><h2>もっと高く。<br/><em>さらに上へ。</em></h2><p>ゴールはない。表示される高度は、あなたが登った本当の記録。足場から落ちるまで、王様を上へ導こう。</p><ol><li><b>01</b>左右だけのシンプル操作</li><li><b>02</b>着地すると自動でジャンプ</li><li><b>03</b>100mごとに記録ラインを突破</li></ol><div className="quote">HOW HIGH<br/>CAN A KING GO?</div></aside>
  </main>;
}
