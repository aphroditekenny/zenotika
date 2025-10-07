/// <reference lib="webworker" />

// Worker: fetch + optional color remap
self.onmessage = async (e: MessageEvent) => {
  const { src, colorRemap, simplify } = e.data as { src: string; colorRemap?: Record<string,string>; simplify?: boolean };
  try {
    const res = await fetch(src);
    const json = await res.json();
  if (colorRemap) {
      const map: Record<string,string> = {};
      Object.entries(colorRemap).forEach(([k,v]) => { map[k.toLowerCase()] = v.toLowerCase(); });
      const hexToArray = (hex: string) => {
        let h = hex.replace('#','');
        if (h.length === 3) h = h.split('').map(c=>c+c).join('');
        const num = parseInt(h,16); return [ (num>>16 &255)/255, (num>>8 &255)/255, (num &255)/255, 1 ];
      };
      const visitShapes = (shapes: any[]) => {
        shapes?.forEach(s => {
          if (s.ty === 'fl' && s.c && Array.isArray(s.c.k)) {
            const [r,g,b] = s.c.k;
            const hex = '#' + [r,g,b].map(v=>{
              const val = Math.round(v*255); return val.toString(16).padStart(2,'0');
            }).join('');
            const target = map[hex];
            if (target) s.c.k = hexToArray(target);
          } else if (s.it) visitShapes(s.it);
        });
      };
      json.layers?.forEach((l: any) => { if (l.shapes) visitShapes(l.shapes); });
    }
    if (simplify && Array.isArray(json.layers)) {
      // Very light simplification: drop empty or fully transparent layers
      json.layers = json.layers.filter((l: any) => {
        if (l.op === 0) return false;
        if (l.ty === 4 && (!l.shapes || l.shapes.length === 0)) return false; // shape layer without shapes
        return true;
      });
    }
    (self as unknown as Worker).postMessage(json);
  } catch (err) {
    (self as unknown as Worker).postMessage({ __error: true, message: (err as Error).message });
  }
};