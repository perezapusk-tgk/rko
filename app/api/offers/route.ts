import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const db = sql();
    const rows = await db`
      select
        o.id,
        o.name,
        o.reward_type as "rewardType",
        o.reward_amount as "rewardAmount",
        o.partner_share as "partnerShare",
        o.currency,
        o.conditions,
        b.code as "bankCode",
        b.name as "bankName"
      from bank_offers o
      join banks b on b.id = o.bank_id
      where o.status = 'active'
        and (o.active_from is null or o.active_from <= now())
        and (o.active_to is null or o.active_to >= now())
      order by b.name, o.created_at desc
    `;
    return NextResponse.json({ ok: true, offers: rows });
  } catch (error) {
    console.error("GET /api/offers", error);
    return NextResponse.json({ ok: false, error: "Не удалось загрузить предложения" }, { status: 500 });
  }
}
