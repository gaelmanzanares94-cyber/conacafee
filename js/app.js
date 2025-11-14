
// app.js - final delivery
const PRODUCTS = [{"id": "p1", "name": "Caf\u00e9 Americano", "desc": "Caf\u00e9 de grano 100% mexicano, 250ml.", "price": 25, "offer": "2x$40", "img": "assets/cafe_americano.svg", "category": "bebidas"}, {"id": "p2", "name": "Capuchino", "desc": "Espresso con leche espumosa y canela.", "price": 35, "offer": "10% estudiantil", "img": "assets/capuchino.svg", "category": "bebidas"}, {"id": "p3", "name": "Latte Vainilla", "desc": "Latte con toques de vainilla natural.", "price": 32, "offer": null, "img": "assets/latte.svg", "category": "bebidas"}, {"id": "p4", "name": "Torta de Jam\u00f3n", "desc": "Pan bolillo artesanal con jam\u00f3n y verduras.", "price": 28, "offer": "Combo + Bebida $45", "img": "assets/torta_jamon.svg", "category": "alimentos"}, {"id": "p5", "name": "Burrito de Frijol", "desc": "Tortilla grande, frijoles refritos y queso.", "price": 20, "offer": "3x$50", "img": "assets/burrito.svg", "category": "alimentos"}, {"id": "p6", "name": "Sandwich de Pollo", "desc": "Pollo a la plancha, lechuga y aderezo casero.", "price": 30, "offer": null, "img": "assets/sandwich_pollo.svg", "category": "alimentos"}, {"id": "p7", "name": "Galleta Casera", "desc": "Galleta con chispas de chocolate, reci\u00e9n horneada.", "price": 10, "offer": "4x$35", "img": "assets/galleta.svg", "category": "postres"}, {"id": "p8", "name": "Brownie", "desc": "Brownie de chocolate con textura h\u00fameda.", "price": 15, "offer": null, "img": "assets/brownie.svg", "category": "postres"}, {"id": "p9", "name": "Pastel Tres Leches", "desc": "Porci\u00f3n individual de tres leches, cremosa.", "price": 18, "offer": "2x$30", "img": "assets/tres_leches.svg", "category": "postres"}];

function initApp(){
  if(!localStorage.getItem('products')) localStorage.setItem('products', JSON.stringify(PRODUCTS));
  if(!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify([]));
  if(!localStorage.getItem('cart')) localStorage.setItem('cart', JSON.stringify([]));
  if(!localStorage.getItem('orders')) localStorage.setItem('orders', JSON.stringify([]));
  bind();
  renderProductsPage();
  renderCartCount();
  tryRegisterSW();
}

function bind(){
  document.getElementById('login-btn')?.addEventListener('click', ()=>document.getElementById('login-modal').style.display='flex');
  document.getElementById('logout-btn')?.addEventListener('click', logout);
  document.getElementById('open-cart')?.addEventListener('click', ()=>location.href='html/cart.html');
  document.getElementById('menu-link')?.addEventListener('click', ()=>location.href='html/products.html');
  document.getElementById('orders-link')?.addEventListener('click', ()=>location.href='html/orders.html');
  document.getElementById('login-form')?.addEventListener('submit', registerOrLogin);
}

function getProducts(){ return JSON.parse(localStorage.getItem('products')||'[]'); }
function getCart(){ return JSON.parse(localStorage.getItem('cart')||'[]'); }
function saveCart(c){ localStorage.setItem('cart', JSON.stringify(c)); renderCartCount(); }
function addToCart(id){ let cart=getCart(); cart.push(id); saveCart(cart); toast('Agregado al carrito'); }

function renderCartCount(){ const el=document.getElementById('cart-count'); if(el) el.textContent = getCart().length; }

function renderProductsPage(){ const list = document.getElementById('products-list'); if(!list) return; list.innerHTML=''; getProducts().forEach(p=>{ const div=document.createElement('div'); div.className='card'; div.innerHTML = '<img src="../'+p.img+'" alt="'+p.name+'"><h3>'+p.name+'</h3><p>'+p.desc+'</p><strong>$'+p.price+'</strong><div>'+(p.offer?('<span class="offer">'+p.offer+'</span>'):'')+'</div><div style="margin-top:8px"><button class="btn" data-id="'+p.id+'">Agregar</button></div>'; list.appendChild(div); }); document.querySelectorAll('.card .btn').forEach(b=>b.addEventListener('click', ()=>addToCart(b.dataset.id))); }

function renderCartPage(){ const area=document.getElementById('cart-area'); if(!area) return; area.innerHTML=''; const cart = getCart(); const products = getProducts(); let total=0; cart.forEach((id,idx)=>{ const p = products.find(x=>x.id===id); if(!p) return; total+=p.price; const div=document.createElement('div'); div.className='card'; div.innerHTML='<h4>'+p.name+'</h4><p>$'+p.price+'</p><div style="margin-top:8px"><button class="btn small" data-idx="'+idx+'" onclick="removeFromCart('+idx+')">Eliminar</button></div>'; area.appendChild(div); }); area.innerHTML += '<h3>Total: $'+total+'</h3>'; const user = getCurrentUser(); if(user){ area.innerHTML += '<div style="margin-top:12px"><button class="btn" id="checkout">Pagar y generar código</button></div>'; document.getElementById('checkout')?.addEventListener('click', ()=>openPayment(total)); } else { area.innerHTML += '<p class="note">Inicia sesión con matrícula para poder pagar.</p>'; } }

function removeFromCart(i){ let cart=getCart(); cart.splice(i,1); saveCart(cart); renderCartPage(); }

function renderOrdersPage(){ const list = document.getElementById('orders-list'); if(!list) return; list.innerHTML=''; const orders = JSON.parse(localStorage.getItem('orders')||'[]'); orders.slice().reverse().forEach(o=>{ const div=document.createElement('div'); div.className='card'; div.innerHTML = '<h4>'+o.code+' - $'+o.total+'</h4><p><b>Alumno:</b> '+o.user.name+' ('+o.user.matricula+')</p><p><small>'+o.date+'</small></p>'; list.appendChild(div); }); }

function registerOrLogin(e){ e.preventDefault(); const name = document.getElementById('student-name').value.trim(); const mat = document.getElementById('student-mat').value.trim(); if(!name||!mat){ alert('Completa nombre y matrícula'); return; } let users = JSON.parse(localStorage.getItem('users')||'[]'); if(!users.find(u=>u.matricula===mat)){ users.push({matricula:mat,name}); localStorage.setItem('users', JSON.stringify(users)); } localStorage.setItem('currentUser', JSON.stringify({matricula:mat,name})); document.getElementById('login-modal').style.display='none'; updateUserUI(); toast('Sesión iniciada'); }

function logout(){ localStorage.removeItem('currentUser'); updateUserUI(); toast('Sesión cerrada'); }
function getCurrentUser(){ return JSON.parse(localStorage.getItem('currentUser')||'null'); }
function updateUserUI(){ const u=getCurrentUser(); const el=document.getElementById('user-label'); if(u){ el.textContent = u.name+' ('+u.matricula+')'; document.getElementById('login-btn').style.display='none'; document.getElementById('logout-btn').style.display='inline-block'; } else { el.textContent='No identificado'; document.getElementById('login-btn').style.display='inline-block'; document.getElementById('logout-btn').style.display='none'; } }

function openPayment(total){ document.getElementById('payment-modal').style.display='flex'; document.getElementById('pay-amount').textContent = total.toFixed(2); const code = genCode(); document.getElementById('pickup-code').textContent = code; document.getElementById('qr-box').innerHTML = '<div style="width:180px;height:180px;display:flex;align-items:center;justify-content:center;background:#000;color:#fff;font-weight:800;border-radius:8px">CNLP<br>'+code.split('-')[1]+'</div>'; document.getElementById('confirm-payment').onclick = ()=>completePayment(code); }

function completePayment(code){ const cart=getCart(); const products=getProducts(); const items = cart.map(id=>products.find(p=>p.id===id)).filter(Boolean); const total = items.reduce((s,p)=>s+p.price,0); const user = getCurrentUser(); const orders = JSON.parse(localStorage.getItem('orders')||'[]'); const order = {id:orders.length+1,user,items,total,code,date:new Date().toLocaleString(),status:'listo'}; orders.push(order); localStorage.setItem('orders', JSON.stringify(orders)); localStorage.setItem('cart', JSON.stringify([])); document.getElementById('payment-modal').style.display='none'; toast('Pago confirmado. Código: '+code); showTicket(order); renderCartCount(); }

function showTicket(order){ const el=document.getElementById('ticket-modal'); el.style.display='flex'; const content=document.getElementById('ticket-content'); let html = '<h2>CONALEP - Cafetería</h2><p><b>Alumno:</b> '+order.user.name+' ('+order.user.matricula+')</p><p><b>Código:</b> <span class="badge">'+order.code+'</span></p><p><b>Items:</b></p>'; order.items.forEach(it=> html+= '<div>'+it.name+' - $'+it.price+'</div>'); html+= '<p><b>Total:</b> $'+order.total+'</p>'; content.innerHTML = html + '<div style="margin-top:12px"><button class="btn" id="download-ticket">Descargar PDF</button> <button class="small" id="print-ticket">Imprimir</button></div>'; document.getElementById('download-ticket').onclick = ()=>downloadPDF(order); document.getElementById('print-ticket').onclick = ()=>window.print(); }

function downloadPDF(order){ if(window.jspdf && window.jspdf.jsPDF){ const doc = new window.jspdf.jsPDF(); doc.setFontSize(16); doc.text('CONALEP - Cafetería',14,20); doc.setFontSize(12); doc.text('Alumno: '+order.user.name+' ('+order.user.matricula+')',14,30); doc.text('Código: '+order.code,14,40); let y=50; order.items.forEach(it=>{ doc.text(it.name+' - $'+it.price,14,y); y+=8; }); doc.text('Total: $'+order.total,14,y+6); doc.save('ticket_'+order.code+'.pdf'); } else { const w=window.open('','ticket'); w.document.write(document.getElementById('ticket-content').innerHTML); w.print(); } }

function genCode(){ const chars='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'; let s=''; for(let i=0;i<6;i++) s+=chars[Math.floor(Math.random()*chars.length)]; return 'CNLP-'+s; }

function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.style.opacity=1; setTimeout(()=>t.style.opacity=0,3000); }

function tryRegisterSW(){ if('serviceWorker' in navigator){ navigator.serviceWorker.register('../pwa/sw.js').then(()=>console.log('SW registered')).catch(()=>{}); } }

document.addEventListener('DOMContentLoaded', ()=>{ initApp(); updateUserUI(); renderCartPage(); renderOrdersPage(); renderProductsPage(); });
