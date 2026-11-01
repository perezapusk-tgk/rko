import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminClient from "./admin-client";

export default async function AdminPage(){
  const session=await auth.api.getSession({headers:await headers()});
  if(!session) redirect("/sign-in");
  const role=(session.user as {role?:string}).role;
  if(role!=="admin") redirect("/");
  return <AdminClient user={{name:session.user.name,email:session.user.email}} />;
}
