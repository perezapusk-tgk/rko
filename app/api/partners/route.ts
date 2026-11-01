import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const partnerCode = String(body.partnerCode || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!name || !partnerCode) {
      return NextResponse.json({ ok: false, error: "Имя и partnerCode обязательны" }, { status: 400 });
    }

    const db = sql();
    const rows = await db`
      insert into partners (partner_code, name, email, telegram_id)
      values (${partnerCode}, ${name}, ${body.email || null}, ${body.telegramId || null})
      returning id, partner_code as "partnerCode", name, email, status, created_at as "createdAt"
    `;
    return NextResponse.json({ ok: true, partner: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/partners", error);
    return NextResponse.json({ ok: false, error: "Не удалось создать партнёра" }, { status: 500 });
  }
}
