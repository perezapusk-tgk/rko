import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const partnerCode = request.nextUrl.searchParams.get("partnerCode") || "nikita";
    const db = sql();
    const rows = await db`
      select
        l.id,
        l.company_name as "companyName",
        l.contact_name as "contactName",
        l.phone,
        l.email,
        l.inn,
        l.status,
        l.source,
        l.created_at as "createdAt",
        b.name as "bankName",
        o.name as "offerName"
      from leads l
      join partners p on p.id = l.partner_id
      left join bank_offers o on o.id = l.offer_id
      left join banks b on b.id = o.bank_id
      where p.partner_code = ${partnerCode}
      order by l.created_at desc
      limit 100
    `;
    return NextResponse.json({ ok: true, leads: rows });
  } catch (error) {
    console.error("GET /api/leads", error);
    return NextResponse.json({ ok: false, error: "Не удалось загрузить лиды" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyName = String(body.companyName || "").trim();
    if (!companyName) return NextResponse.json({ ok: false, error: "Укажите название компании" }, { status: 400 });

    const partnerCode = String(body.partnerCode || "nikita").trim();
    const db = sql();
    const partners = await db`select id from partners where partner_code = ${partnerCode} limit 1`;
    if (!partners.length) {
      await db`insert into partners (partner_code, name, status) values (${partnerCode}, ${body.partnerName || partnerCode}, 'active')`;
    }
    const partner = await db`select id from partners where partner_code = ${partnerCode} limit 1`;

    const offerId = body.offerId ? String(body.offerId) : null;
    const rows = await db`
      insert into leads (
        partner_id, offer_id, company_name, contact_name, phone, email, inn, source, metadata
      ) values (
        ${partner[0].id}, ${offerId}, ${companyName},
        ${body.contactName || null}, ${body.phone || null}, ${body.email || null},
        ${body.inn || null}, ${body.source || "partner_cabinet"}, ${JSON.stringify(body.metadata || {})}
      )
      returning id, company_name as "companyName", status, created_at as "createdAt"
    `;
    return NextResponse.json({ ok: true, lead: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads", error);
    return NextResponse.json({ ok: false, error: "Не удалось создать лид" }, { status: 500 });
  }
}
