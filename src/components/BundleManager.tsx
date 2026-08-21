import { useMemo, useState } from "react";
import type { ApiPanel, ApiService, Bundle, BundleServiceSelections, RotatingService, ServiceType } from "../types/order";
import { Button, Card, Input, EmptyState, StatusPill } from "./ui";

const TYPES: { key: ServiceType; label: string; tone: string; keywords: string[] }[] = [
  { key:"views", label:"Views", tone:"indigo", keywords:["view","views"] },
  { key:"likes", label:"Likes", tone:"pink", keywords:["like","likes"] },
  { key:"shares", label:"Shares", tone:"sky", keywords:["share","shares"] },
  { key:"saves", label:"Saves", tone:"violet", keywords:["save","saves"] },
  { key:"comments", label:"Comments", tone:"emerald", keywords:["comment","comments"] },
  { key:"reposts", label:"Reposts", tone:"cyan", keywords:["repost","reposts","reshare"] },
];
const emptyRotations = (): BundleServiceSelections => ({ views:[], likes:[], shares:[], saves:[], comments:[], reposts:[] });
function servicesFor(apis: ApiPanel[], apiId: string, keywords: string[]) {
  const all = apis.find(a => a.id === apiId)?.services ?? [];
  const matched = all.filter(s => keywords.some(k => s.name.toLowerCase().includes(k)));
  return matched.length ? matched : all;
}
function ServiceSelect({ options, value, onChange, label, panelName }: { options:ApiService[]; value:string; onChange:(v:string)=>void; label:string; panelName:string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? options.filter(s => s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)) : options;
  }, [options, search]);
  const selected = options.find(s => s.id === value);
  const displayRate = (service?: ApiService) => service?.rate ? `Rate: ${service.rate}` : "Rate unavailable";
  return <div className="relative space-y-1"><span className="text-xs font-medium text-slate-600">{label}</span>
    <button type="button" className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left text-xs" onClick={() => setOpen(v => !v)}>{selected ? <span className="flex items-center justify-between gap-2"><span className="truncate">#{selected.id} {selected.name}</span><span className="flex-shrink-0 text-[10px] text-emerald-600">{displayRate(selected)}</span></span> : "Search and select service ID"}</button>
    {open && <><div className="fixed inset-0 z-10" onClick={() => { setOpen(false); setSearch(""); }} /><div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl"><div className="border-b bg-slate-50 p-2"><input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search service ID or name..." className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs" /></div><div className="max-h-56 overflow-y-auto">{filtered.length ? filtered.map(s => <button key={s.id} type="button" className="block w-full px-3 py-2 text-left text-xs hover:bg-indigo-50" onClick={() => { onChange(s.id); setOpen(false); setSearch(""); }}><span className="font-mono text-slate-500">#{s.id}</span> <span>{s.name}</span><span className="ml-1 text-slate-400">({panelName})</span><span className="ml-2 font-medium text-emerald-600">{displayRate(s)}</span></button>) : <p className="p-3 text-center text-xs text-slate-500">No matching service</p>}</div><p className="border-t bg-slate-50 px-3 py-1.5 text-[10px] text-slate-500">{filtered.length} service{filtered.length === 1 ? "" : "s"} found</p></div></>}
  </div>;
}
function normalize(bundle: Bundle): BundleServiceSelections {
  const out = emptyRotations();
  for (const t of TYPES) {
    const configured = bundle.rotations?.[t.key];
    if (configured?.length) out[t.key] = configured.slice(0,3);
    else if (bundle.serviceIds?.[t.key]) out[t.key] = [{ apiId: bundle.apiId || "", serviceId: bundle.serviceIds[t.key] }];
  }
  return out;
}

export function BundleManager({ apis, bundles, onAddBundle, onUpdateBundle, onDeleteBundle }: { apis:ApiPanel[]; bundles:Bundle[]; onAddBundle:(b:{name:string; rotations:BundleServiceSelections})=>void; onUpdateBundle:(id:string,b:{name:string; rotations:BundleServiceSelections})=>void; onDeleteBundle:(id:string)=>void }) {
  const [open,setOpen]=useState(false), [editing,setEditing]=useState<string|null>(null), [name,setName]=useState(""), [rotations,setRotations]=useState<BundleServiceSelections>(emptyRotations());
  const reset=()=>{setOpen(false);setEditing(null);setName("");setRotations(emptyRotations());};
  const edit=(b:Bundle)=>{setEditing(b.id);setName(b.name);setRotations(normalize(b));setOpen(true);};
  const setSlot=(type:ServiceType,slot:number,field:keyof RotatingService,value:string)=>setRotations(prev=>({...prev,[type]:prev[type].map((x,i)=>i===slot?{...x,[field]:value,...(field==="apiId"?{serviceId:""}:{})}:x)}));
  const addSlot=(type:ServiceType)=>setRotations(prev=>prev[type].length>=3?prev:{...prev,[type]:[...prev[type],{apiId:"",serviceId:""}]});
  const removeSlot=(type:ServiceType,slot:number)=>setRotations(prev=>({...prev,[type]:prev[type].filter((_,i)=>i!==slot)}));
  return <div className="space-y-5">
    <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Collections</p><h2 className="mt-1 text-xl font-bold text-slate-900">Service bundles</h2><p className="mt-1 text-sm text-slate-500">Choose a different panel per service and up to 3 rotating services per type.</p></div><Button variant={open?"secondary":"primary"} onClick={()=>open?reset():setOpen(true)}>{open?"Close":"Create bundle"}</Button></div>
    {open&&<Card padding="md"><h3 className="mb-4 text-sm font-semibold text-slate-900">{editing?"Edit bundle":"New bundle"}</h3><form className="space-y-4" onSubmit={e=>{e.preventDefault();const clean={...rotations};for(const t of TYPES)clean[t.key]=clean[t.key].filter(x=>x.apiId&&x.serviceId);if(!name.trim()||!clean.views.length)return;if(editing)onUpdateBundle(editing,{name:name.trim(),rotations:clean});else onAddBundle({name:name.trim(),rotations:clean});reset();}}><Input label="Bundle name" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Multi-panel growth package"/><div className="space-y-5 border-t border-slate-200 pt-4"><div><p className="text-sm font-medium text-slate-800">Service rotation</p><p className="text-xs text-slate-500">Add up to 3 services for each type. Runs use them round-robin: 1 → 2 → 3 → 1.</p></div>{TYPES.map(t=><div key={t.key} className="rounded-lg border border-slate-100 p-3"><div className="mb-2 flex items-center justify-between"><span className="text-sm font-semibold text-slate-700">{t.label}</span>{rotations[t.key].length<3&&<Button type="button" size="sm" variant="outline" onClick={()=>addSlot(t.key)}>+ Add slot</Button>}</div>{rotations[t.key].length===0?<p className="text-xs text-slate-400">No service configured</p>:<div className="space-y-2">{rotations[t.key].map((slot,i)=><div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"><label className="block space-y-1"><span className="text-xs font-medium text-slate-600">Slot {i+1} panel</span><select className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs" value={slot.apiId} onChange={e=>setSlot(t.key,i,"apiId",e.target.value)}><option value="">Select panel</option>{apis.map(a=><option key={a.id} value={a.id}>{a.name} ({a.services.length})</option>)}</select></label><ServiceSelect label="Service ID" panelName={apis.find(a=>a.id===slot.apiId)?.name||""} options={servicesFor(apis,slot.apiId,t.keywords)} value={slot.serviceId} onChange={v=>setSlot(t.key,i,"serviceId",v)} /><Button type="button" size="sm" variant="ghost" className="self-end text-rose-600" onClick={()=>removeSlot(t.key,i)}>Remove</Button></div>)}</div>}</div>)}</div><div className="flex gap-2"><Button type="submit" variant="primary">{editing?"Update bundle":"Save bundle"}</Button>{editing&&<Button type="button" variant="outline" onClick={reset}>Cancel</Button>}</div></form></Card>}
    {bundles.length===0?<EmptyState icon={<span>▦</span>} title="No bundles yet" description="Create your first multi-panel service bundle." action={<Button variant="primary" onClick={()=>setOpen(true)}>Create bundle</Button>}/>:<div className="grid gap-3 sm:grid-cols-2">{bundles.map(b=><Card key={b.id} padding="md" hover><div className="mb-3 flex items-start justify-between gap-3"><div><h3 className="text-base font-semibold text-slate-900">{b.name}</h3><p className="mt-1 text-xs text-slate-500">Multi-panel rotation bundle</p></div><StatusPill kind="brand">{TYPES.reduce((n,t)=>n+(b.rotations?.[t.key]?.length||(!b.rotations&&b.serviceIds?.[t.key]?1:0)),0)} slots</StatusPill></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{TYPES.map(t=><div key={t.key} className="rounded-md bg-slate-50 px-2.5 py-2"><p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{t.label}</p><p className="mt-0.5 text-xs font-mono text-slate-700">{(b.rotations?.[t.key]||[]).map(x=>`${x.apiId}:${x.serviceId}`).join(" • ")||b.serviceIds?.[t.key]||"—"}</p></div>)}</div><div className="mt-3 flex gap-2 border-t border-slate-100 pt-3"><Button size="sm" variant="outline" onClick={()=>edit(b)}>Edit</Button><Button size="sm" variant="ghost" className="text-rose-600" onClick={()=>{if(confirm("Delete this bundle?"))onDeleteBundle(b.id)}}>Delete</Button></div></Card>)}</div>}
  </div>;
}
