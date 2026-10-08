import { useEffect, useEffectEvent, useRef, useState } from "react"
import { ArrowRight, Bookmark, Check, Expand, ExternalLink, Focus, Layers, RotateCcw, Search, X } from "lucide-react"
import { ATLAS_SYSTEMS, atlasNameMatches, buildAtlasTargets, selectionMatchesConcept } from "../lib/atlasLearning"
import { shuffleItems } from "../lib/practice"

const ATLAS_URL = "/human-atlas/index.html"
export function HumanBodyView({ notebook, onNotebookChange, onNavigate }) {
  const frame = useRef(null)
  const studio = useRef(null)
  const [atlas, setAtlas] = useState(null)
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)
  const [mode, setMode] = useState("explore")
  const [selection, setSelection] = useState(null)
  const [query, setQuery] = useState("")
  const [systems, setSystems] = useState([])
  const [wide, setWide] = useState(false)
  const [challenge, setChallenge] = useState(null)
  const [answer, setAnswer] = useState("")
  const [feedback, setFeedback] = useState("")
  const [challengeDone, setChallengeDone] = useState(false)
  const [challengePool, setChallengePool] = useState("core")
  const targets = atlas ? buildAtlasTargets(atlas) : []
  const challengeTargets = challengePool === "saved"
    ? (atlas?.concepts ?? []).filter(concept => notebook.bookmarks.some(saved => saved.id === concept.id || saved.name.toLowerCase() === concept.name.toLowerCase()))
    : challengePool === "expanded"
      ? (atlas?.concepts ?? []).filter(concept => concept.elements.length > 0 && concept.elements.length <= 8)
      : targets
  const results = query.trim() && atlas ? atlas.concepts.filter(c => c.name.toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>a.name.length-b.name.length).slice(0,12) : []

  function send(action, data = {}) {
    frame.current?.contentWindow?.postMessage({ type: "study-buddy:command", action, ...data }, window.location.origin)
  }
  function record(correct, response) {
    const result = { id: challenge.id, name: challenge.name, mode, correct, response, at: new Date().toISOString() }
    onNotebookChange({ ...notebook, results: [...(notebook.results ?? []), result].slice(-100) })
  }
  const handleSelection = useEffectEvent(chosen => {
    if (mode === "hunt" && challenge && !challengeDone) {
      const correct = selectionMatchesConcept(chosen, challenge)
      setFeedback(correct ? "Found it! Explore the highlighted structure, then try another." : "That’s a different structure. Keep looking, or use Show me for a guided reveal.")
      record(correct, chosen.name)
      if (correct) setChallengeDone(true)
    }
    if (mode !== "recall" || challengeDone) setSelection(chosen)
  })

  useEffect(() => {
    const abort = new AbortController()
    fetch("/human-atlas/models/atlas.json", { signal: abort.signal }).then(response => { if (!response.ok) throw new Error("The anatomy catalogue could not be loaded."); return response.json() }).then(setAtlas).catch(caught => { if (caught.name !== "AbortError") setError(caught.message) })
    return () => abort.abort()
  }, [retry])
  useEffect(() => {
    const timeout = setTimeout(() => { setError("The atlas is taking longer than expected. Try reloading the viewer; your saved notes will stay here.") }, 45000)
    const receive = event => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return
      const data = event.data
      if (data?.type === "human-atlas:status") {
        setProgress(data.progress ?? 0)
        if (data.error) { setError(data.error); setReady(false) }
        else if (data.progress === 100) { setReady(true); setError(""); clearTimeout(timeout) }
      }
      if (data?.type === "human-atlas:error") setError(data.message || "That structure could not be selected.")
      if (data?.type === "human-atlas:selection") {
        const chosen = data.selection ?? data
        if (!chosen.name || !Array.isArray(chosen.elements)) return
        handleSelection(chosen)
      }
    }
    window.addEventListener("message", receive)
    return () => { window.removeEventListener("message", receive); clearTimeout(timeout) }
  }, [retry])
  function choose(concept) {
    setError("")
    send("select", { name: concept.name, isolate: false })
    setQuery("")
  }
  function changeMode(next) {
    setMode(next); setChallenge(null); setAnswer(""); setFeedback(""); setChallengeDone(false)
    send("reset"); setSelection(null); setSystems([])
  }
  function startChallenge() {
    if (!challengeTargets.length) return
    const pool = challengeTargets.filter(item => item.id !== challenge?.id)
    const target = shuffleItems(pool)[0] ?? challengeTargets[0]
    setChallenge(target); setAnswer(""); setFeedback(""); setChallengeDone(false); setSelection(null)
    send(mode === "recall" ? "challenge" : "reset", mode === "recall" ? { name: target.name, hideLabels: true } : {})
    if (mode === "hunt") send("systems", { systems: [...new Set(atlas.parts.filter(p => target.elements.includes(p.id)).map(p => p.system))] })
  }
  function reveal() {
    setChallengeDone(true)
    setFeedback("Guided reveal. This attempt does not count as a correct recall.")
    record(false, "revealed")
    send("select", { name: challenge.name, isolate: true })
  }
  function checkAnswer(event) {
    event.preventDefault()
    const correct = atlasNameMatches(answer, challenge.name)
    record(correct, answer)
    setChallengeDone(true)
    setFeedback(correct ? "You’ve got it. Now see it in context." : `The atlas name is “${challenge.name}”. Explore it, then come back for another round.`)
    send("select", { name: challenge.name, isolate: true })
  }
  function toggleBookmark() {
    const exists = notebook.bookmarks.some(item => item.id === selection.id)
    onNotebookChange({ ...notebook, bookmarks: exists ? notebook.bookmarks.filter(item => item.id !== selection.id) : [...notebook.bookmarks, { id: selection.id, name: selection.name, elements: selection.elements, system: selection.system }] })
  }
  function toggleSystem(id) {
    const next = systems.includes(id) ? systems.filter(item => item !== id) : [...systems,id]
    setSystems(next); send("systems", { systems: next })
  }
  return <div className="space-y-4">
    <section className="studio-intro"><div><span className="source-tag supplemental">SUPPLEMENTAL / HUMAN ATLAS</span><h2>The body, one layer at a time.</h2><p>Explore 2,234 structures. Pull them apart. Make the connections.</p></div><div className="studio-mode" aria-label="Anatomy activity">{[["explore","Explore"],["hunt","Find it"],["recall","Name it"]].map(([id,label],index)=><button key={id} aria-pressed={mode===id} onClick={()=>changeMode(id)}><span>0{index+1}</span>{label}</button>)}</div></section>
    <div className={`atlas-workbench ${wide ? "is-wide" : ""}`} ref={studio}>
      <section className="atlas-frame-wrap" aria-label="Anatomy viewer">
        <div className="atlas-toolbar"><span><span className="viewer-status-dot"/>{ready ? "LIVE 3D ATLAS" : "PREPARING ATLAS"}</span><div><button aria-label="Reset anatomy view" title="Reset view" onClick={()=>{ send("reset"); setSelection(null); setSystems([]); setChallenge(null) }} disabled={!ready}><RotateCcw size={17}/></button><button aria-label={wide ? "Show study companion" : "Expand viewer"} title="Expand viewer" onClick={()=>setWide(!wide)}><Expand size={17}/></button><a href={ATLAS_URL} target="_blank" rel="noreferrer" aria-label="Open Human Atlas in a new tab" title="Open full screen"><ExternalLink size={17}/></a></div></div>
        <iframe key={retry} ref={frame} src={ATLAS_URL} title="Human Atlas — interactive 3D human body explorer" onLoad={()=>send("ping")} allowFullScreen/>
        {!ready && !error && <div className="atlas-loading" role="status">Preparing the anatomy catalogue… {progress > 0 ? `${Math.round(progress)}% of model data` : "Large 3D models may take a moment."}</div>}
        {error && <div className="atlas-error" role="alert"><p>{error}</p><button className="action action-secondary" onClick={()=>{setReady(false);setError("");setProgress(0);setRetry(value=>value+1)}}>Reload viewer</button></div>}
      </section>
      {!wide && <aside className="atlas-companion">
        {mode==="explore" ? <>
          <p className="eyebrow">Your field guide</p><h3>Follow your curiosity.</h3>
          <p className="companion-copy">Click the body to inspect a structure, or jump straight to one.</p>
          <label className="atlas-search"><Search size={16}/><input type="search" aria-label="Find an atlas structure" placeholder="Heart, femur, brain…" value={query} onChange={event=>setQuery(event.target.value)}/>{query&&<button aria-label="Clear structure search" onClick={()=>setQuery("")}><X size={15}/></button>}</label>
          {query.trim() && <div className="atlas-search-results">{results.length ? results.map(c=><button key={c.id} disabled={!ready} onClick={()=>choose(c)}>{c.name}<ArrowRight size={13}/></button>) : <p>No matching structures. Try a shorter name.</p>}</div>}
          {!query && <div className="quick-structures">{targets.slice(0,4).map(c=><button key={c.id} disabled={!ready} onClick={()=>choose(c)}>{c.name}</button>)}</div>}
          <details className="system-disclosure"><summary><Layers size={16}/> Choose systems</summary><p>These controls show exactly the systems you select.</p><div className="system-picks">{ATLAS_SYSTEMS.map(([id,label])=><button key={id} disabled={!ready} onClick={()=>toggleSystem(id)} aria-pressed={systems.includes(id)}>{label}</button>)}</div></details>
          {selection && <section className="structure-note"><div className="section-heading"><span className="eyebrow">Selected structure</span><button aria-label={notebook.bookmarks.some(item=>item.id===selection.id) ? "Unsave structure" : "Save structure"} onClick={toggleBookmark}><Bookmark size={18} fill={notebook.bookmarks.some(item=>item.id===selection.id) ? "currentColor" : "none"}/></button></div><h4>{selection.name}</h4><button className="action action-secondary" onClick={()=>send("select",{name:selection.name,isolate:true})}><Focus size={15}/> Isolate & inspect</button><label className="field mt-4"><span>Your study note</span><textarea className="resize-none" rows={3} maxLength={2000} value={notebook.notes[selection.id] ?? ""} placeholder="A connection you want to remember…" onChange={event=>onNotebookChange({...notebook,notes:{...notebook.notes,[selection.id]:event.target.value}})}/></label></section>}
          <details className="saved-structures" open={notebook.bookmarks.length>0}><summary>Saved structures <span>{notebook.bookmarks.length}</span></summary>{notebook.bookmarks.length ? notebook.bookmarks.map(item=><div key={item.id}><button disabled={!ready} onClick={()=>choose(item)}>{item.name}</button><button aria-label={`Remove ${item.name} from saved structures`} onClick={()=>onNotebookChange({...notebook,bookmarks:notebook.bookmarks.filter(saved=>saved.id!==item.id)})}><X size={14}/></button></div>) : <p>Save an interesting structure to revisit it.</p>}</details>
        </> : <>
          <p className="eyebrow">{mode==="hunt" ? "Level 01 / Find it" : "Level 02 / Name it"}</p><h3>{mode==="hunt" ? "Turn a name into a place." : "Turn a shape into a name."}</h3><p className="companion-copy">{mode==="hunt" ? "Find the named structure in the body. Rotate and zoom, then click it. The matching system is shown for you." : "An isolated structure appears without its label. Type its atlas name; include left or right when applicable."}</p>
          <label className="field mb-4"><span>Challenge collection</span><select value={challengePool} onChange={event=>{setChallengePool(event.target.value);setChallenge(null);setFeedback("");setChallengeDone(false);send("reset")}}><option value="core">Core structures · {targets.length}</option><option value="saved">Your saved structures</option><option value="expanded">Expanded catalogue · advanced</option></select></label>
          <p className="companion-copy">{challengeTargets.length.toLocaleString()} structures in this collection.{challengePool === "saved" && !challengeTargets.length ? " Save structures in Explore to build your own visual practice set." : ""}</p>
          {!challenge && <button className="action" disabled={!ready || !challengeTargets.length} onClick={startChallenge}>Start a visual challenge <ArrowRight size={16}/></button>}
          {challenge && <div className="visual-challenge"><span className="source-tag supplemental">Supplemental identification</span><h4>{mode==="hunt" ? `Find: ${challenge.name}` : challengeDone ? challenge.name : "What is this structure?"}</h4>{mode==="recall" && !challengeDone && <form noValidate onSubmit={checkAnswer}><label className="field"><span>Your answer</span><input autoComplete="off" value={answer} onChange={event=>setAnswer(event.target.value)}/></label><button className="action mt-3" disabled={!answer.trim()}>Check my answer <Check size={15}/></button></form>}{feedback && <p className="challenge-feedback" role="status">{feedback}</p>}{!challengeDone && <button className="action action-secondary mt-3" onClick={reveal}>Show me</button>}{challengeDone && <button className="action mt-3" onClick={startChallenge}>Another challenge <ArrowRight size={16}/></button>}</div>}
          <p className="companion-copy mt-5">{(notebook.results ?? []).filter(result=>result.correct).length} of your last {notebook.results?.length ?? 0} attempts identified correctly. These activities use atlas names, separate from your textbook question bank.</p>
          <button className="action action-secondary" onClick={()=>onNavigate("bones")}>Course bone landmarks <ArrowRight size={16}/></button>
        </>}
        <div className="companion-bottom"><p>Bring it back to class.</p><button onClick={()=>onNavigate("chapters")}>Open your course notes <ArrowRight size={15}/></button></div>
      </aside>}
    </div>
    <div className="atlas-footnote"><p>Drag to orbit · Scroll or pinch to zoom · Use the explode slider to see every piece.<br/>Reference anatomy: adult male. Atlas descriptions and challenges are supplemental.</p><p>Human Atlas by Ashe Magalhaes · MIT<br/>BodyParts3D © DBCLS · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> · <a href="/human-atlas/ATTRIBUTION.md" target="_blank" rel="noreferrer">Full attribution</a></p></div>
  </div>
}
