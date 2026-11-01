import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sql } from "@/lib/db";

async function guard(){
  const session=await auth.api.getSession({headers:await headers()});
  if(!session) return null;
  if((session.user as {role?:string}).role!=="admin") return null;
  return session;
}

export async function GET(){
  try{
    if(!await guard()) return NextResponse.json({ok:false,error:"Нет доступа"},{status:403});
    const db=sql();
    const [partners,banks,offers,leads,commissions,payouts,stats]=await Promise.all([
      db.query('select id,partner_code as "partnerCode",name,email,status,created_at as "createdAt" from partners order by created_at desc limit 100'),
      db.query('select id,code,name,status from banks order by name'),
      db.query('select o.id,o.name,o.product_type as "productType",o.reward_type as "rewardType",o.reward_amount as "rewardAmount",o.partner_share as "partnerShare",o.currency,o.status,b.name as "bankName",b.code as "bankCode" from bank_offers o join banks b on b.id=o.bank_id order by o.created_at desc limit 100'),
      db.query('select l.id,l.company_name as "companyName",l.status,l.created_at as "createdAt",p.name as "partnerName",b.name as "bankName" from leads l join partners p on p.id=l.partner_id left join bank_offers o on o.id=l.offer_id left join banks b on b.id=o.bank_id order by l.created_at desc limit 100'),
      db.query('select c.id,c.amount,c.currency,c.status,c.created_at as "createdAt",p.name as "partnerName",l.company_name as "companyName" from commissions c join partners p on p.id=c.partner_id join leads l on l.id=c.lead_id order by c.created_at desc limit 100'),
      db.query('select pr.id,pr.amount,pr.currency,pr.status,pr.created_at as "createdAt",p.name as "partnerName" from payout_requests pr join partners p on p.id=pr.partner_id order by pr.created_at desc limit 100'),
      db.query('select (select count(*)::int from partners) partners,(select count(*)::int from leads) leads,(select count(*)::int from commissions) commissions,(select count(*)::int from payout_requests) payouts')
    ]);
    return NextResponse.json({ok:true,partners:partners.rows,banks:banks.rows,offers:offers.rows,leads:leads.rows,commissions:commissions.rows,payouts:payouts.rows,stats:stats.rows[0]});
  }catch(e){console.error(e);return NextResponse.json({ok:false,error:"Не удалось загрузить админ-данные"},{status:500})}
}

export async function POST(request:NextRequest){
  try{
    if(!await guard()) return NextResponse.json({ok:false,error:"Нет доступа"},{status:403});
    const body=await request.json(); const action=String(body.action||""); const db=sql();
    if(action==="lead_status"){
      const status=String(body.status||"");
      if(!["new","sent","application","approved","opened","rejected","paid","cancelled"].includes(status)) return NextResponse.json({ok:false,error:"Недопустимый статус"},{status:400});
      await db.query("update leads set status=$1,updated_at=now() where id=$2",[status,String(body.id)]);
    } else if(action==="bank"){
      const code=String(body.code||"").trim().toLowerCase(), name=String(body.name||"").trim();
      if(!code||!name) return NextResponse.json({ok:false,error:"Укажите код и название банка"},{status:400});
      await db.query("insert into banks(code,name,status) values($1,$2,'active') on conflict(code) do update set name=excluded.name,status='active',updated_at=now()",[code,name]);
    } else if(action==="offer"){
      const bankId=String(body.bankId||""), name=String(body.name||"").trim();
      if(!bankId||!name) return NextResponse.json({ok:false,error:"Укажите банк и название предложения"},{status:400});
      await db.query("insert into bank_offers(bank_id,name,product_type,reward_type,reward_amount,partner_share,currency,conditions,status) values($1,$2,$3,$4,$5,$6,$7,$8,'active')",[bankId,name,String(body.productType||"rko"),String(body.rewardType||"fixed"),Number(body.rewardAmount||0),Number(body.partnerShare||0),String(body.currency||"RUB").slice(0,3),JSON.stringify(body.conditions||{})]);
    } else if(action==="payout_status"){
      const status=String(body.status||"");
      if(!["requested","processing","paid","rejected","cancelled"].includes(status)) return NextResponse.json({ok:false,error:"Недопустимый статус выплаты"},{status:400});
      await db.query("update payout_requests set status=$1,processed_at=case when $1 in ('paid','rejected','cancelled') then now() else processed_at end where id=$2",[status,String(body.id)]);
    } else return NextResponse.json({ok:false,error:"Неизвестное действие"},{status:400});
    return NextResponse.json({ok:true});
  }catch(e){console.error(e);return NextResponse.json({ok:false,error:"Операция не выполнена"},{status:500})}
}
