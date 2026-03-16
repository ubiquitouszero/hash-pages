/**
 * Tracking Link Generator (Cloudflare Pages Function)
 * Same UI as Netlify version, just served from /api/share instead of /.netlify/functions/share
 */

export async function onRequestGet() {
  return new Response(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Share with Tracking</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui;background:#f1f5f9;color:#1e293b;line-height:1.5}
.c{max-width:520px;margin:60px auto;padding:0 20px}.card{background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.08);overflow:hidden}
.h{background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;padding:24px 28px;text-align:center}.h h1{font-size:18px;margin-bottom:4px}.h p{font-size:13px;opacity:.9}
.f{padding:24px 28px}label{display:block;font-size:12px;font-weight:600;color:#475569;text-transform:uppercase;margin-bottom:6px;margin-top:16px}
input{width:100%;padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px}input:focus{outline:none;border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.1)}
.hint{font-size:11px;color:#94a3b8;margin-top:4px}.out{margin-top:20px;display:none}.out.v{display:block}
.url{width:100%;padding:12px;background:#eff6ff;border:2px solid #2563eb;border-radius:8px;font-family:monospace;font-size:13px;word-break:break-all;cursor:pointer}
.acts{display:flex;gap:8px;margin-top:10px}.btn{flex:1;padding:10px;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
.bc{background:#2563eb;color:#fff}.bv{background:#f1f5f9;color:#475569}</style></head>
<body><div class="c"><div class="card"><div class="h"><h1>Share with Tracking</h1><p>Generate a tracked link for any page</p></div>
<div class="f"><label>Page URL or Slug</label><input type="text" id="u" placeholder="https://yourdomain.com/page-slug/" spellcheck="false">
<div class="hint">Paste any page URL or just the slug</div>
<label>Recipient Name</label><input type="text" id="r" placeholder="dan, sarah, investor" spellcheck="false">
<div class="hint">Lowercase. Shows in Slack alerts and view stats.</div>
<div class="out" id="o"><label>Tracked Link</label><div class="url" id="res" onclick="cp()"></div>
<div class="acts"><button class="btn bc" id="cb" onclick="cp()">Copy Link</button><button class="btn bv" onclick="ov()">View Stats</button></div></div></div></div></div>
<script>let s='';function up(){const u=document.getElementById('u').value.trim(),ref=document.getElementById('r').value.trim().toLowerCase().replace(/[^a-z0-9-]/g,'');
let sl='';try{if(u.includes('/')){const x=new URL(u.startsWith('http')?u:'https://'+u);sl=x.pathname.replace(/^\\//, '').replace(/\\/$/, '')}else if(/^[a-z0-9-]+$/.test(u))sl=u}catch(e){sl=u.replace(/^\\//,'').replace(/\\/$/,'')}
if(!sl||!ref){document.getElementById('o').classList.remove('v');return}s=sl;document.getElementById('r').value=ref;
document.getElementById('res').textContent=location.origin+'/'+sl+'/?ref='+ref;document.getElementById('o').classList.add('v')}
document.getElementById('u').addEventListener('input',up);document.getElementById('r').addEventListener('input',up);
function cp(){navigator.clipboard.writeText(document.getElementById('res').textContent).then(()=>{const b=document.getElementById('cb');b.textContent='Copied!';setTimeout(()=>b.textContent='Copy Link',2000)})}
function ov(){if(s)window.open('/api/views?page='+s,'_blank')}</script></body></html>`, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
