#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';
const ROOT = process.cwd();
const CSS_DIR = join(ROOT,'src');
function walk(d){const out=[];for(const e of readdirSync(d,{withFileTypes:true})) if(e.isDirectory()) out.push(...walk(join(d,e.name))); else if(extname(e.name)==='.css') out.push(join(d,e.name)); return out;}
const files = walk(CSS_DIR);
const DURATION_REGEX = /animation:\s*[^;]*?(\d+(?:\.\d+)?)(ms|s)[^;]*;/g;
const LONG=[];
for(const f of files){const c=readFileSync(f,'utf8');let m;while((m=DURATION_REGEX.exec(c))){let val=parseFloat(m[1]);if(m[2]==='s') val*=1000; if(val>=5000) LONG.push({file:f.replace(ROOT+"/",''), durationMs:val, snippet:m[0].slice(0,120)});} }
console.log(JSON.stringify({longAnimations:LONG},null,2));