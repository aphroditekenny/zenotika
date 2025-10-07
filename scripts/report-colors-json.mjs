#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';
const ROOT = process.cwd();
const CSS_DIR = join(ROOT, 'src');
const HEX_REGEX = /#[0-9a-fA-F]{3,8}\b/g;
function collect(dir){const out=[];for(const e of readdirSync(dir,{withFileTypes:true})){if(e.isDirectory()) out.push(...collect(join(dir,e.name))); else if(extname(e.name)==='.css') out.push(join(dir,e.name));}return out;}
const files=collect(CSS_DIR);const data={};
for(const f of files){const c=readFileSync(f,'utf8');const m=c.match(HEX_REGEX);if(m){m.forEach(h=>{h=h.toLowerCase();data[h]=data[h]||{count:0,files:new Set()};data[h].count++;data[h].files.add(f.replace(ROOT+"/",''));});}}
const out=Object.entries(data).map(([hex,info])=>({hex,count:info.count,files:[...info.files]})).sort((a,b)=>b.count-a.count);
console.log(JSON.stringify(out,null,2));
