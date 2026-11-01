import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminPage(){const session=await auth.api.getSession({headers:await headers()});if(!session)redirect("/sign-in");const role=(session.user as {role?:string}).role;if(role!=="admin")redirect("/");return <main style={{padding:32,fontFamily:"system-ui"}}><h1>RKO Partner — Админ-панель</h1><p>{session.user.name} · {session.user.email}</p><div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:16,marginTop:24}}>{["Партнёры","Банки и предложения","Лиды","Выплаты"].map(x=><section key={x} style={{padding:20,border:"1px solid #e5e7eb",borderRadius:16}}><b>{x}</b><p style={{color:"#64748b"}}>Модуль подключается к реальным данным Neon.</p></section>)}</div></main>;
}
