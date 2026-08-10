const KEY="tuners_oeste_punto_evo_v1";
const defaultData={
  project:{name:"Trovão de Prata",model:"Fiat Punto Evo",engine:"1.3 Multijet 95cv",power:"95 cv",year:2011,color:"Cinza Prata",instagram:"https://www.instagram.com/tunersdooeste/",initialKm:0},
  records:[
    {id:1,date:"2024-05-25",km:245300,type:"Revisão",description:"Óleo 5W30, filtro óleo, filtro ar, filtro combustível",supplier:"Auto Ribeiro",cost:120,notes:""},
    {id:2,date:"2024-07-10",km:248750,type:"Peças",description:"Pastilhas de travão frente + sensores",supplier:"Auto Ribeiro",cost:85,notes:""},
    {id:3,date:"2024-09-15",km:252100,type:"Revisão",description:"Óleo 5W30, filtro óleo",supplier:"Auto Ribeiro",cost:65,notes:""},
    {id:4,date:"2024-11-02",km:255500,type:"Outros",description:"Limpeza EGR",supplier:"Auto Ribeiro",cost:50,notes:""},
    {id:5,date:"2024-12-20",km:258000,type:"Peças",description:"Bateria 70Ah",supplier:"Auto Ribeiro",cost:95,notes:""}
  ]
};
let data=load();
let editMode=false;

function load(){
  try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(defaultData)}
  catch(e){return structuredClone(defaultData)}
}
function save(){localStorage.setItem(KEY,JSON.stringify(data));render()}
function euro(v){return Number(v||0).toLocaleString("pt-PT",{minimumFractionDigits:2,maximumFractionDigits:2})+" €"}
function datePt(s){if(!s)return"";const [y,m,d]=s.split("-");return `${d}/${m}/${y}`}
function badgeClass(t){return t==="Revisão"?"badge-rev":t==="Peças"?"badge-pec":t==="Reparação"?"badge-rep":t==="Inspeção"?"badge-ins":"badge-out"}

function render(){
  const p=data.project, rs=[...data.records].sort((a,b)=>Number(b.km)-Number(a.km));
  document.getElementById("heroYear").textContent=p.year||"—";
  document.getElementById("projectData").innerHTML=[
    ["Nome do Projeto",p.name],["Modelo",p.model],["Motor",p.engine],["Potência",p.power],
    ["Ano",p.year],["Cor",p.color],["Instagram",`<a href="${escapeAttr(p.instagram)}" target="_blank" rel="noopener">Abrir ↗</a>`]
  ].map(x=>`<div class="project-row"><span>${x[0]}</span><b>${x[1]||"—"}</b></div>`).join("");
  document.getElementById("recordsBody").innerHTML=rs.map(r=>`
    <tr>
      <td>${datePt(r.date)}</td><td>${Number(r.km||0).toLocaleString("pt-PT")} km</td>
      <td><span class="badge ${badgeClass(r.type)}">${escapeHtml(r.type)}</span></td>
      <td>${escapeHtml(r.description)}</td><td>${escapeHtml(r.supplier||"—")}</td><td>${euro(r.cost)}</td>
      <td class="actions">
        <button class="icon-btn" title="Editar" onclick="openEdit(${r.id})">✎</button>
        <button class="icon-btn delete-btn" title="Apagar ficheiro/registo" onclick="deleteRecord(${r.id})">🗑</button>
      </td>
    </tr>`).join("");
  document.getElementById("emptyState").classList.toggle("hidden",rs.length!==0);
  const total=rs.reduce((a,r)=>a+Number(r.cost||0),0), km=rs.length?Math.max(...rs.map(r=>Number(r.km||0))):Number(p.initialKm||0);
  document.getElementById("totalRecords").textContent=rs.length;
  document.getElementById("currentKm").textContent=km.toLocaleString("pt-PT")+" km";
  document.getElementById("totalCost").textContent=euro(total);
  document.getElementById("statRecords").textContent=rs.length;
  document.getElementById("statCost").textContent=euro(total);
  document.getElementById("statAvg").textContent=euro(rs.length?total/rs.length:0);
  document.getElementById("statKm").textContent=km.toLocaleString("pt-PT")+" km";
  const counts={};rs.forEach(r=>counts[r.type]=(counts[r.type]||0)+1);
  const max=Math.max(1,...Object.values(counts));
  document.getElementById("typeStats").innerHTML=Object.entries(counts).map(([k,v])=>`<div class="bar-row"><span>${escapeHtml(k)}</span><div class="bar"><i style="width:${v/max*100}%"></i></div><b>${v}</b></div>`).join("")||"<p style='color:#777'>Sem dados.</p>";
  document.getElementById("editState").textContent=editMode?"ON":"OFF";
  document.getElementById("editModeBtn").classList.toggle("btn-red",editMode);
  fillProjectForm();
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function escapeAttr(s){return String(s??"").replace(/"/g,"&quot;")}

function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.toggle("active-section",s.id===id));
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.section===id));
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>showSection(b.dataset.section)));
document.querySelectorAll("[data-section-go]").forEach(b=>b.addEventListener("click",()=>showSection(b.dataset.sectionGo)));
document.getElementById("newRecordBtn").onclick=()=>showSection("new");
document.getElementById("newRecordBtn2").onclick=()=>showSection("new");
document.getElementById("editModeBtn").onclick=()=>{editMode=!editMode;render()};
document.getElementById("editProjectBtn").onclick=()=>showSection("project");

document.getElementById("recordForm").addEventListener("submit",e=>{
  e.preventDefault(); const f=new FormData(e.target);
  data.records.push({id:Date.now(),date:f.get("date"),km:Number(f.get("km")),type:f.get("type"),description:f.get("description"),supplier:f.get("supplier"),cost:Number(f.get("cost")||0),notes:f.get("notes")});
  save(); e.target.reset(); showSection("maintenance");
});

function openEdit(id){
  const r=data.records.find(x=>x.id===id); if(!r)return;
  const f=document.getElementById("editForm");
  Object.keys(r).forEach(k=>{if(f.elements[k])f.elements[k].value=r[k]});
  document.getElementById("modal").classList.remove("hidden");
}
function closeModal(){document.getElementById("modal").classList.add("hidden")}
document.getElementById("closeModal").onclick=closeModal;
document.getElementById("cancelModal").onclick=closeModal;
document.getElementById("editForm").addEventListener("submit",e=>{
  e.preventDefault();const f=new FormData(e.target), id=Number(f.get("id")), r=data.records.find(x=>x.id===id);
  if(r){Object.assign(r,{date:f.get("date"),km:Number(f.get("km")),type:f.get("type"),description:f.get("description"),supplier:f.get("supplier"),cost:Number(f.get("cost")||0),notes:f.get("notes")})}
  save();closeModal();
});
function deleteRecord(id){
  const r=data.records.find(x=>x.id===id); if(!r)return;
  if(confirm(`Apagar o registo "${r.description}"?\nEsta ação não pode ser desfeita.`)){data.records=data.records.filter(x=>x.id!==id);save()}
}
window.openEdit=openEdit;window.deleteRecord=deleteRecord;

function fillProjectForm(){
  const f=document.getElementById("projectForm"),p=data.project;
  Object.keys(p).forEach(k=>{if(f.elements[k])f.elements[k].value=p[k]});
}
document.getElementById("projectForm").addEventListener("submit",e=>{
  e.preventDefault();const f=new FormData(e.target);
  data.project={name:f.get("name"),model:f.get("model"),engine:f.get("engine"),power:f.get("power"),year:f.get("year"),color:f.get("color"),instagram:f.get("instagram"),initialKm:Number(f.get("initialKm")||0)};
  document.querySelectorAll(".instagram-link").forEach(a=>a.href=data.project.instagram);
  document.querySelectorAll(".instagram-cta").forEach(a=>a.href=data.project.instagram);
  save();showSection("maintenance");
});

document.getElementById("exportBtn").onclick=()=>{
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="tuners-do-oeste-backup.json";a.click();URL.revokeObjectURL(a.href);
};
document.getElementById("importInput").onchange=e=>{
  const file=e.target.files[0];if(!file)return;const reader=new FileReader();
  reader.onload=()=>{try{const x=JSON.parse(reader.result);if(x.project&&Array.isArray(x.records)){data=x;save();alert("Ficheiro importado com sucesso.")}else throw Error()}catch(_){alert("Ficheiro inválido.")}};
  reader.readAsText(file);e.target.value="";
};
document.getElementById("clearAllBtn").onclick=()=>{
  if(confirm("Apagar TODOS os registos de manutenção? Os dados do Projeto Fiat serão mantidos.")){data.records=[];save()}
};
render();
