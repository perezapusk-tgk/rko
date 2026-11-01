"use client";

import {useEffect,useState} from "react";

type Data={partners:any[];banks:any[];offers:any[];leads:any[];commissions:any[];payouts:any[];stats:any};

export default function AdminClient({user}:{user:{name:string;email:string}}){
 const [tab,setTab]=useState("Обзор"),[data,setData]=useState<Data|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 const [bank,setBank]=useState({code:"",name:""}),[offer,setOffer]=useState({bankId:"",name:"",rewardAmount:"",partnerShare:""});
 async function load(){setLoading(true);try{const r=await fetch("/api/admin",{cache:"no-store"});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||"Ошибка");setData(d)}catch(e){setError(e instanceof Error?e.message:"Ошибка")}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 async function act(body:any){const r=await fetch("/api/admin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||"Операция не выполнена");await load()}
 const nav=["Обзор","Партнёры","Банки","Предложения","Лиды","Комиссии","Выплаты"];
 const stat=data?.stats||{};
 return <main style={{minHeight:"100vh",background:"#f5f7fb",padding:24,fontFamily:"system-ui",color:"#111827"}}>
  <div style={{maxWidth:1280,margin:"0 auto"}}>
   <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
    <div><div style={{fontWeight:900,fontSize:25}}>RKO PARTNER <span style={{fontSize:11,color:"#6671dc"}}>ADMIN</span></div><div style={{color:"#64748b",fontSize:13}}>{user.name} · {user.email}</div></div>
    <a href="/" style={{color:"#475569",textDecoration:"none"}}>← В кабинет</a>
   </header>
   <nav style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:18}}>{nav.map(n=><button key={n} onClick={()=>setTab(n)} style={{border:0,borderRadius:9,padding:"9px 13px",background:tab===n?"#111827":"#fff",color:tab===n?"#fff":"#475569",cursor:"pointer",fontWeight:700}}>{n}</button>)}</nav>
   {error&&<div style={{background:"#fff1f2",border:"1px solid #fecdd3",padding:12,borderRadius:10,marginBottom:14,color:"#9f1239"}}>{error}</div>}
   {loading?<div style={card}>Загрузка…</div>:!data?<div style={card}>Нет данных</div>:tab==="Обзор"?<><div style={grid}>{[["Партнёры",stat.partners],["Лиды",stat.leads],["Комиссии",stat.commissions],["Выплаты",stat.payouts]].map(x=><div style={card} key={x[0]}><div style={{color:"#64748b",fontSize:13}}>{x[0]}</div><strong style={{fontSize:30}}>{x[1]}</strong></div>)}</div><div style={card}><h2 style={h2}>Контроль платформы</h2><p style={muted}>Здесь управляются банки, предложения, статусы лидов и выплаты. Финансовые записи не редактируются задним числом.</p></div></>:
   tab==="Партнёры"?<Table rows={data.partners} cols={["name","partnerCode","email","status"]}/>:tab==="Банки"?<><div style={card}><h2 style={h2}>Добавить / обновить банк</h2><div style={form}><input placeholder="Код: tbank" value={bank.code} onChange={e=>setBank({...bank,code:e.target.value})}/><input placeholder="Название банка" value={bank.name} onChange={e=>setBank({...bank,name:e.target.value})}/><button style={darkBtn} onClick={async()=>{try{await act({action:"bank",...bank});setBank({code:"",name:""})}catch(e){setError(e instanceof Error?e.message:"Ошибка")}}}>Сохранить</button></div></div><Table rows={data.banks} cols={["code","name","status"]}/></>:tab==="Предложения"?<><div style={card}><h2 style={h2}>Новое предложение</h2><div style={form}><select value={offer.bankId} onChange={e=>setOffer({...offer,bankId:e.target.value})}><option value="">Выберите банк</option>{data.banks.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select><input placeholder="Название" value={offer.name} onChange={e=>setOffer({...offer,name:e.target.value})}/><input placeholder="Reward, ₽" inputMode="decimal" value={offer.rewardAmount} onChange={e=>setOffer({...offer,rewardAmount:e.target.value})}/><input placeholder="Доля партнёра, ₽" inputMode="decimal" value={offer.partnerShare} onChange={e=>setOffer({...offer,partnerShare:e.target.value})}/><button style={darkBtn} onClick={async()=>{try{await act({action:"offer",...offer});setOffer({bankId:"",name:"",rewardAmount:"",partnerShare:""})}catch(e){setError(e instanceof Error?e.message:"Ошибка")}}}>Создать</button></div></div><Table rows={data.offers} cols={["bankName","name","rewardAmount","partnerShare","currency","status"]}/></>:tab==="Лиды"?<LeadTable rows={data.leads} onStatus={async(id,status)=>{try{await act({action:"lead_status",id,status})}catch(e){setError(e instanceof Error?e.message:"Ошибка")}}}/>:tab==="Комиссии"?<Table rows={data.commissions} cols={["partnerName","companyName","amount","currency","status"]}/>:<PayoutTable rows={data.payouts} onStatus={async(id,status)=>{try{await act({action:"payout_status",id,status})}catch(e){setError(e instanceof Error?e.message:"Ошибка")}}}/>}
  </div>
 </main>
}

const card={background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:18,marginBottom:14} as const;
const grid={display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:14} as const;
const form={display:"grid",gridTemplateColumns:"repeat(5,minmax(0,1fr))",gap:8} as const;
const h2={fontSize:17,margin:"0 0 12px"} as const;
const muted={color:"#64748b",fontSize:13} as const;
const darkBtn={border:0,borderRadius:9,padding:"10px 14px",background:"#111827",color:"#fff",fontWeight:700,cursor:"pointer"} as const;

function Table({rows,cols}:{rows:any[];cols:string[]}){return <div style={{...card,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{cols.map(c=><th key={c} style={th}>{c}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={r.id||i}>{cols.map(c=><td key={c} style={td}>{String(r[c]??"—")}</td>)}</tr>)}</tbody></table>{!rows.length&&<div style={muted}>Пока пусто.</div>}</div>}
const th={textAlign:"left",padding:"10px 8px",borderBottom:"1px solid #e5e7eb",color:"#64748b"} as const;
const td={padding:"11px 8px",borderBottom:"1px solid #eef2f7"} as const;

function LeadTable({rows,onStatus}:{rows:any[];onStatus:(id:string,status:string)=>void}){return <div style={{...card,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{["Компания","Партнёр","Банк","Статус"].map(x=><th style={th} key={x}>{x}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.id}><td style={td}>{r.companyName}</td><td style={td}>{r.partnerName}</td><td style={td}>{r.bankName||"—"}</td><td style={td}><select value={r.status} onChange={e=>onStatus(r.id,e.target.value)}><option value="new">Новый</option><option value="sent">Отправлен</option><option value="application">Заявка</option><option value="approved">Одобрено</option><option value="opened">Счёт открыт</option><option value="rejected">Отказ</option><option value="paid">Выплачено</option><option value="cancelled">Отменён</option></select></td></tr>)}</tbody></table>{!rows.length&&<div style={muted}>Пока пусто.</div>}</div>}
function PayoutTable({rows,onStatus}:{rows:any[];onStatus:(id:string,status:string)=>void}){return <div style={{...card,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{["Партнёр","Сумма","Валюта","Статус"].map(x=><th style={th} key={x}>{x}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.id}><td style={td}>{r.partnerName}</td><td style={td}>{r.amount}</td><td style={td}>{r.currency}</td><td style={td}><select value={r.status} onChange={e=>onStatus(r.id,e.target.value)}><option value="requested">Запрошено</option><option value="processing">В обработке</option><option value="paid">Выплачено</option><option value="rejected">Отклонено</option><option value="cancelled">Отменено</option></select></td></tr>)}</tbody></table>{!rows.length&&<div style={muted}>Пока пусто.</div>}</div>}
