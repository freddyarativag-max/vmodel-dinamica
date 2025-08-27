import React, { useMemo, useState, useEffect } from 'react'

/**
 * App: Dinámica del Modelo en V (arrastrar y soltar) — Versión 1.1
 * - Sin respuestas quemadas en el código.
 * - El mapa de validación se pasa por URL como Base64: ?map=... (JSON codificado).
 *   Ej: btoa(JSON.stringify({ "req-sis":"t-acep","req-sw":"t-sis","dis-arq":"t-int","dis-mod":"t-unit" }))
 */

const LEFT_PHASES = [
  { id: 'req-sis', label: 'Requerimientos del sistema' },
  { id: 'req-sw', label: 'Requisitos de software' },
  { id: 'dis-arq', label: 'Diseño de arquitectura' },
  { id: 'dis-mod', label: 'Diseño de módulos' },
  { id: 'cod', label: 'Codificación' },
]

const RIGHT_TESTS = [
  { id: 't-unit', label: 'Pruebas unitarias' },
  { id: 't-int', label: 'Pruebas de integración' },
  { id: 't-sis', label: 'Pruebas de sistema' },
  { id: 't-acep', label: 'Pruebas de aceptación' },
]

// Lee ?map=... desde la URL (Base64 → JSON). Si no existe, retorna null (modo estudiante).
function parseMapParam() {
  try {
    const b64 = new URLSearchParams(location.search).get('map')
    if (!b64) return null
    const json = atob(b64)
    return JSON.parse(json) // { "req-sis":"t-acep", ... }
  } catch (e) {
    console.warn("No se pudo leer el parámetro 'map'", e)
    return null
  }
}

const SCENARIOS = [
  { id:'parking', name:'Parqueaderos (Centro Comercial)', description:'App móvil para cupos de parqueo en tiempo real, con integración a mapas y pagos.' },
  { id:'auto', name:'Automotriz (ISO 26262)', description:'Software embebido para ABS con requisitos de seguridad y trazabilidad.' },
  { id:'med', name:'Médico (Signos vitales)', description:'Monitoreo continuo con alarmas y validación regulatoria.' },
  { id:'aero', name:'Aeroespacial (Dron)', description:'Rutas, evasión de obstáculos, redundancia y verificación sistemática.' },
]

function shuffle(a){ const arr=[...a]; for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]} return arr }

function useTimer(running){
  const [s,setS]=useState(0)
  useEffect(()=>{ if(!running) return; const id=setInterval(()=>setS(v=>v+1),1000); return()=>clearInterval(id) },[running])
  return [s,setS]
}

function Card({id,label}){
  const onDragStart=(e)=>{ e.dataTransfer.setData('text/plain', id) }
  return <div className="card" draggable onDragStart={onDragStart}>{label}</div>
}

const LABELS = [...LEFT_PHASES, ...RIGHT_TESTS].reduce((acc, x)=>{ acc[x.id]=x.label; return acc }, {})

function Slot({id,label,placement,setPlacement,validated,answerMap}){
  const cardId = placement[id]
  const onDrop = (e)=>{
    e.preventDefault()
    const dragId = e.dataTransfer.getData('text/plain')
    if(!dragId) return
    if(placement[id]) return // ocupado
    const next = {...placement}
    Object.keys(next).forEach(k=>{ if(next[k]===dragId) next[k]=null })
    next[id]=dragId
    setPlacement(next)
  }
  const onDragOver = (e)=>e.preventDefault()
  const isOk = validated && !!answerMap && cardId===id // solo marca ok si hay mapa (modo docente)
  return (
    <div className={'slot'+(isOk?' ok':'')} onDrop={onDrop} onDragOver={onDragOver}>
      {cardId ? <Card id={cardId} label={LABELS[cardId]}/> : <span className="small">{label}</span>}
    </div>
  )
}

function Bank({cards,placement,setPlacement}){
  const placed = new Set(Object.values(placement).filter(Boolean))
  const avail = cards.filter(c=>!placed.has(c.id))
  const onDrop=(e)=>{
    e.preventDefault()
    const dragId=e.dataTransfer.getData('text/plain')
    if(!dragId) return
    const next={...placement}
    Object.keys(next).forEach(k=>{ if(next[k]===dragId) next[k]=null })
    setPlacement(next)
  }
  return (
    <div className="bank" onDrop={onDrop} onDragOver={(e)=>e.preventDefault()}>
      {avail.length===0 ? <div className="small muted">No hay tarjetas disponibles. Arrastra alguna desde un slot para liberarla.</div> :
        <div className="row">
          {avail.map(c=><Card key={c.id} id={c.id} label={c.label}/>)}
        </div>
      }
    </div>
  )
}

function formatTime(s){ const m=Math.floor(s/60); const r=s%60; return m+":"+String(r).padStart(2,'0') }

function Board({team, initialScenario}){
  const [cards,setCards] = useState(()=>shuffle([...LEFT_PHASES, ...RIGHT_TESTS]))
  const [placement,setPlacement] = useState(()=>{
    const p={}; [...LEFT_PHASES.map(x=>x.id), ...RIGHT_TESTS.map(x=>x.id)].forEach(id=>p[id]=null); return p
  })
  const [validated,setValidated]=useState(false)
  const [running,setRunning]=useState(true)
  const [seconds,setSeconds]=useTimer(running)
  const [score,setScore]=useState(0)
  const [scenario,setScenario]=useState(initialScenario||SCENARIOS[0].id)

  const left=LEFT_PHASES.map(x=>x.id)
  const right=RIGHT_TESTS.map(x=>x.id)
  const answerMap = useMemo(()=>parseMapParam(), [])
  const scenarioObj = SCENARIOS.find(s=>s.id===scenario)

  function reset(reshuffle=false){
    const p={}; [...left, ...right].forEach(id=>p[id]=null)
    setPlacement(p); setValidated(false); setRunning(true); setSeconds(0); setScore(0)
    if(reshuffle) setCards(shuffle(cards))
  }

  function validate(){
    if(!answerMap){
      alert("Validación protegida: agrega ?map=... (Base64) en la URL para habilitar la corrección (solo docente).")
      return
    }
    let pts=0
    Object.entries(answerMap).forEach(([phaseId,testId])=>{
      if(placement[phaseId]===phaseId && placement[testId]===testId) pts+=1
    })
    const allPlaced = [...left,...right].every(k=>placement[k])
    if(allPlaced) pts+=1
    setScore(pts); setValidated(true); setRunning(false)
  }

  function exportResults(){
    const data = { team, scenario, elapsed_seconds: seconds, score, placement, timestamp:new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href=url; a.download=`resultado_vmodel_${team.replace(/\s+/g,'_')}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="panel">
      <div className="header">
        <div>
          <div className="h1">{team}</div>
          <div className="muted small">Escenario: {scenarioObj?.name}</div>
          <div className="small muted">{scenarioObj?.description}</div>
        </div>
        <div className="small" style={{textAlign:'right'}}>
          <div>Tiempo</div>
          <div className="score">{formatTime(seconds)}</div>
          <div className="row" style={{marginTop:6}}>
            <button onClick={()=>setRunning(r=>!r)}>{running?'Pausar':'Reanudar'}</button>
            <button onClick={()=>{setSeconds(0); setRunning(true)}}>Reiniciar</button>
          </div>
        </div>
      </div>

      <div className="grid grid-3" style={{marginTop:12}}>
        <div>
          <div className="small" style={{fontWeight:600, marginBottom:6}}>Desarrollo</div>
          <div className="grid">
            {LEFT_PHASES.map(f=>(
              <Slot key={f.id} id={f.id} label={f.label} placement={placement} setPlacement={setPlacement} validated={validated} answerMap={answerMap}/>
            ))}
          </div>
        </div>

        <div>
          <div className="panel" style={{padding:12}}>
            <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
              <div style={{fontWeight:600}}>Banco de tarjetas</div>
              <select value={scenario} onChange={e=>setScenario(e.target.value)}>
                {SCENARIOS.map(s=>(<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
            <div style={{marginTop:8}}>
              <Bank cards={cards} placement={placement} setPlacement={setPlacement}/>
            </div>
            <div className="row" style={{marginTop:10}}>
              <button onClick={()=>reset(false)}>Reiniciar</button>
              <button onClick={()=>reset(true)}>Mezclar tarjetas</button>
              <button className="primary" onClick={validate}>Validar</button>
              <button onClick={exportResults}>Exportar resultado</button>
            </div>

            {validated && (
              <div className="panel" style={{marginTop:10}}>
                {answerMap ? (
                  <div className="row" style={{justifyContent:'space-between', width:'100%'}}>
                    <div><b>Resultado</b></div>
                    <div>Puntaje: <span className="score">{score}</span></div>
                  </div>
                ) : (
                  <div className="small" style={{color:'#b91c1c'}}>
                    Validación deshabilitada — añade ?map=... (Base64) en la URL (solo docente).
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="panel help" style={{marginTop:8}}>
            <div style={{fontWeight:600, marginBottom:6}}>Relaciones esperadas</div>
            {answerMap ? (
              <ul className="small">
                <li>Requerimientos del sistema ↔ Pruebas de aceptación</li>
                <li>Requisitos de software ↔ Pruebas de sistema</li>
                <li>Diseño de arquitectura ↔ Pruebas de integración</li>
                <li>Diseño de módulos ↔ Pruebas unitarias</li>
              </ul>
            ) : (
              <div className="small muted">(Oculto para estudiantes) — El docente habilita la solución con ?map=... en la URL.</div>
            )}
          </div>
        </div>

        <div>
          <div className="small" style={{fontWeight:600, marginBottom:6}}>Pruebas</div>
          <div className="grid">
            {RIGHT_TESTS.map(t=>(
              <Slot key={t.id} id={t.id} label={t.label} placement={placement} setPlacement={setPlacement} validated={validated} answerMap={answerMap}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App(){
  const params = new URLSearchParams(location.search)
  const soloTeam = params.get('team')

  const [teams,setTeams] = useState(()=>{
    const saved = localStorage.getItem('vmodel_teams')
    return saved ? JSON.parse(saved) : [
      { id: 'Equipo 1', scenario:'parking' },
      { id: 'Equipo 2', scenario:'auto' },
    ]
  })
  useEffect(()=>{ localStorage.setItem('vmodel_teams', JSON.stringify(teams)) },[teams])

  const [newTeam,setNewTeam]=useState('Equipo nuevo')
  const [newScenario,setNewScenario]=useState('parking')

  function addTeam(){
    if(!newTeam.trim()) return
    if(teams.some(t=>t.id===newTeam.trim())) return alert('Ese nombre ya existe.')
    setTeams([...teams, {id:newTeam.trim(), scenario:newScenario}])
    setNewTeam('')
  }
  function removeTeam(id){
    setTeams(teams.filter(t=>t.id!==id))
  }
  const toLink = (id)=> `${location.origin}${location.pathname}?team=${encodeURIComponent(id)}`
  const visible = soloTeam ? teams.filter(t=>t.id===soloTeam) : teams

  return (
    <div>
      <div className="container">
        <div className="header">
          <div>
            <div className="h1">Dinámica interactiva — Modelo en V (multi-equipo)</div>
            <div className="muted">Arrastra y suelta las tarjetas para formar la "V" y emparejar fases ↔ pruebas. Exporta el resultado de tu equipo.</div>
          </div>
        </div>

        <div className="panel" style={{marginTop:12}}>
          <div className="row" style={{alignItems:'flex-end'}}>
            <div>
              <div className="small muted">Nombre del equipo</div>
              <input value={newTeam} onChange={e=>setNewTeam(e.target.value)} placeholder="Ej: Grupo A"/>
            </div>
            <div>
              <div className="small muted">Escenario</div>
              <select value={newScenario} onChange={e=>setNewScenario(e.target.value)}>
                {SCENARIOS.map(s=>(<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
            <button className="primary" onClick={addTeam}>Agregar equipo</button>
          </div>
          <div className="small muted" style={{marginTop:8}}>Tip: comparte un enlace directo a un equipo con "Abrir link" en cada tarjeta.</div>
        </div>

        <div className="team-grid" style={{marginTop:12}}>
          {visible.map(t=>(
            <div key={t.id}>
              <div className="row" style={{justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                <div className="row" style={{gap:6}}>
                  <div className="panel" style={{padding:'6px 10px'}}><b>{t.id}</b></div>
                  <div className="panel small" style={{padding:'6px 10px'}}>
                    { (function(){ const s = ['parking','auto','med','aero'].includes(t.scenario) ? t.scenario : 'parking'; const obj = {parking:'Parqueaderos (Centro Comercial)', auto:'Automotriz (ISO 26262)', med:'Médico (Signos vitales)', aero:'Aeroespacial (Dron)'}; return obj[s]; })() }
                  </div>
                </div>
                <div className="row">
                  <a href={toLink(t.id)} target="_blank" rel="noreferrer"><button>Abrir link</button></a>
                  <button onClick={()=>removeTeam(t.id)}>Eliminar</button>
                </div>
              </div>
              <Board team={t.id} initialScenario={t.scenario}/>
            </div>
          ))}
        </div>

        <div className="footer">© Dinámica educativa — Modelo en V</div>
      </div>
    </div>
  )
}
