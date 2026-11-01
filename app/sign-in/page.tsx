"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const [mode,setMode]=useState<"signIn"|"signUp">("signIn");
  const [name,setName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");const r=mode==="signIn"?await authClient.signIn.email({email,password,callbackURL:"/"}):await authClient.signUp.email({email,password,name,callbackURL:"/"});setBusy(false);if(r.error)setError(r.error.message||"Не удалось выполнить вход");else window.location.href="/";}
  return <main className="authPage"><form className="authCard" onSubmit={submit}><div className="authLogo"><span>RKO</span><b>PARTNER</b></div><h1>{mode==="signIn"?"Вход в кабинет":"Регистрация партнёра"}</h1><p>{mode==="signIn"?"Войдите, чтобы управлять лидами и комиссиями.":"Создайте партнёрский кабинет."}</p>{mode==="signUp"&&<label>Имя<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Ваше имя"/></label>}<label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.ru"/></label><label>Пароль<input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Минимум 8 символов"/></label>{error&&<div className="errorBox">{error}</div>}<button className="primary authSubmit" disabled={busy}>{busy?"Подождите...":mode==="signIn"?"Войти":"Создать кабинет"}</button><button type="button" className="authSwitch" onClick={()=>setMode(mode==="signIn"?"signUp":"signIn")}>{mode==="signIn"?"Нет аккаунта? Зарегистрироваться":"Уже есть аккаунт? Войти"}</button></form></main>;
}
