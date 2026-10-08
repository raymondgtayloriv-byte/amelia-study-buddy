import { Activity, ArrowUpRight, BookOpen } from "lucide-react"
export function Sidebar({ navigationItems, activeSection, metrics, onSectionChange }) {
  return <aside className="studio-sidebar">
    <button className="studio-brand" onClick={() => onSectionChange("human-body")} aria-label="Amelia’s Study Buddy, open anatomy studio"><span className="brand-symbol"><Activity size={23}/></span><span>Amelia’s<span className="brand-subtitle">STUDY BUDDY</span></span></button>
    <div className="sidebar-label">YOUR WORKSPACE</div>
    <nav aria-label="Study navigation">{navigationItems.map(item => { const Icon = item.icon; return <button key={item.id} onClick={() => onSectionChange(item.id)} className={`studio-nav-item ${activeSection === item.id ? "is-active" : ""}`} aria-current={activeSection === item.id ? "page" : undefined}><Icon size={19}/><span>{item.label}</span>{activeSection === item.id && <span className="nav-dot"/>}</button> })}</nav>
    <div className="sidebar-progress"><BookOpen size={18}/><p>Little by little.<br/><strong>You’re building the picture.</strong></p><div className="progress-track"><span style={{ width: `${metrics.overallProgress}%` }}/></div><div className="sidebar-progress-meta"><span>{metrics.completedReadyChapters}/{metrics.totalReadyChapters} chapters reviewed</span><span>{metrics.overallProgress}%</span></div></div>
    <button className="sidebar-footer" onClick={() => onSectionChange("sync")}>Missing a chapter? <ArrowUpRight size={16}/><span>Add your course notes anytime.</span></button>
  </aside>
}
