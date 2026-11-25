// Общая шапка экранов МП 2026 (1080×1080): красный фон, светлое поле со скруглением с 206 px.
// MPH.mount([{id:'tQ', text:'Вопрос'}, ...]) — заголовки в одной ячейке (для смены «Вопрос → Ответ»).
// Вариант раскладки: ?h=b (по умолчанию: петух слева, как в эталоне) или ?h=a (петух справа, как на афише).
(function(){
  const V = (new URLSearchParams(location.search).get('h') || 'b').toLowerCase();
  const BAND = 206;                 // верх светлого поля
  const G = {
    // петух справа, «встаёт» на светлое поле; надпись между заголовком и петухом
    a: { lockup:{l:44,t:34,h:138}, rooster:{r:14,t:-8,h:240}, title:{l:214,t:30,align:'left'},
         rem:{l:424,t:114,w:236,rot:-11} },
    // петух слева рядом с логотипом (как в эталоне), заголовок справа, надпись под ним заходит на поле
    b: { lockup:{l:44,t:34,h:138}, rooster:{l:198,t:24,h:206}, title:{r:48,t:30,align:'right'},
         rem:{r:64,t:122,w:212,rot:-11} },
  }[V];

  const css = `
  .mph{position:absolute;z-index:5;display:block}
  .mph-title{position:absolute;z-index:5;display:grid}
  .mph-title h1{grid-area:1/1;font-family:'Oswald',sans-serif;font-weight:700;text-transform:uppercase;color:#F9F0E4;
                font-size:84px;line-height:.92;white-space:nowrap;letter-spacing:.01em}
  .mph-clip{position:absolute;left:0;width:1080px;overflow:hidden;z-index:6;pointer-events:none}
  .mph-rem{position:absolute;transform-origin:50% 50%}
  .mph-rem img{position:absolute;display:block}
  #rooster{transform-origin:62% 92%}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const R = { lockup:2070/1987, rooster:2123/1713 };
  function img(src, box, id){
    const e = document.createElement('img'); e.src = src; e.className = 'mph'; if (id) e.id = id;
    e.style.height = box.h+'px'; e.style.top = box.t+'px';
    if (box.l != null) e.style.left = box.l+'px'; else e.style.right = box.r+'px';
    return e;
  }
  // «Ремесло / в прянике» под углом, как на афише. Рисуется дважды и режется по краю поля:
  // над красным — золотом, над светлым полем — красным.
  let remW = 0;
  function remeslo(stage){
    const g = G.rem, s = g.w/1223;
    const w1 = g.w, h1 = 272*s, w2 = 1334*s, h2 = 393*s;
    const dx2 = w1*0.12, dy2 = h1*1.0;
    const W = Math.max(w1, dx2+w2), H = dy2+h2;
    const left = g.l != null ? g.l : 1080 - g.r - W;
    remW = W;
    for (const part of ['top','bot']){
      const clip = document.createElement('div'); clip.className = 'mph-clip';
      clip.style.top = (part==='top' ? 0 : BAND)+'px';
      clip.style.height = (part==='top' ? BAND : 1080-BAND)+'px';
      const r = document.createElement('div'); r.className = 'mph-rem'; r.dataset.part = part;
      Object.assign(r.style, {left:left+'px', top:(g.t - (part==='top'?0:BAND))+'px', width:W+'px', height:H+'px', transform:`rotate(${g.rot}deg)`});
      const c = part==='top' ? 'gold' : 'red';
      r.innerHTML = `<img src="assets/remeslo_1_${c}.png" style="left:0;top:0;width:${w1}px;height:${h1}px" alt="">`+
                    `<img src="assets/remeslo_2_${c}.png" style="left:${dx2}px;top:${dy2}px;width:${w2}px;height:${h2}px" alt="">`;
      clip.appendChild(r); stage.appendChild(clip);
    }
  }

  window.MPH = {
    variant: V, band: BAND,
    mount(titles){
      const stage = document.getElementById('stage');
      stage.appendChild(img('assets/lockup.png', G.lockup));
      stage.appendChild(img('assets/rooster.png', G.rooster, 'rooster'));
      const tb = document.createElement('div'); tb.className = 'mph-title'; tb.id = 'mphTitle';
      tb.style.top = G.title.t+'px';
      if (G.title.l != null) tb.style.left = G.title.l+'px'; else tb.style.right = G.title.r+'px';
      tb.style.justifyItems = G.title.align==='right' ? 'end' : 'start';
      tb.innerHTML = titles.map(t=>`<h1 id="${t.id}">${t.text}</h1>`).join('');
      stage.appendChild(tb);
      remeslo(stage);
    },
    // Раскладка правой части (вызывать после загрузки шрифтов):
    // заголовок + «Ремесло» ставятся по центру свободного места между петухом и правым краем.
    // Короткий заголовок («Вопрос», «Ответ») — петух отходит от логотипа, блок смещается левее.
    fit(){
      const rooster = document.getElementById('rooster'), tb = document.getElementById('mphTitle');
      const hs = [...tb.querySelectorAll('h1')];
      const RIGHT = 1080 - 48, GAP = 30, SHORT = 420;
      const widest = () => Math.max(...hs.map(h=>h.getBoundingClientRect().width));
      hs.forEach(h=>h.style.fontSize='');
      if (V === 'b'){
        const short = widest() < SHORT;
        rooster.style.left = (G.rooster.l + (short ? 36 : 0))+'px';
        const rRight = rooster.getBoundingClientRect().right;
        // если не влезает — уменьшаем кегль
        let fs = 84;
        const blockW = () => { const tw = widest(); return Math.max(tw, Math.max(28 + remW, tw - 16)); };
        while (blockW() > RIGHT - rRight - GAP && fs > 50){ fs -= 2; hs.forEach(h=>h.style.fontSize=fs+'px'); }
        const tw = widest(), bw = blockW();
        const L = rRight + GAP, x = Math.round(L + Math.max(0, (RIGHT - L - bw)/2));
        tb.style.right = ''; tb.style.left = x+'px'; tb.style.justifyItems = 'start';
        const remLeft = Math.max(x + 28, x + tw - 16 - remW);
        document.querySelectorAll('.mph-rem').forEach(r=>r.style.left = remLeft+'px');
      } else {
        const rr = rooster.getBoundingClientRect();
        hs.forEach(h=>{ let fs = 84;
          while (h.getBoundingClientRect().right > rr.left - 18 && fs > 50){ fs -= 2; h.style.fontSize = fs+'px'; } });
      }
    },
  };
})();
