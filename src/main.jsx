import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, AlertCircle, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, Check,
  CheckCircle2, ChevronDown, CircleHelp, Clock3, Command, Filter, LayoutDashboard,
  ListTodo, LogOut, Menu, MessageSquare, MoreHorizontal, Plus, Search, Settings,
  ShieldCheck, Sparkles, Users, X, Zap, CalendarDays, CircleDot, ClipboardList
} from 'lucide-react';
import './styles.css';

const initialItems = [
  { id: 'OPS-1048', title: 'Payment gateway latency spike', description: 'Checkout requests are intermittently exceeding the 2s threshold.', type: 'Incident', priority: 'Critical', status: 'In Progress', team: 'Platform', assignee: 'AM', person: 'Aarav Mehta', due: 'Today, 2:30 PM', age: '12 min ago', color: 'violet' },
  { id: 'OPS-1047', title: 'Review KYC verification backlog', description: 'Review pending identity verification cases from the weekend.', type: 'Compliance', priority: 'High', status: 'Awaiting Approval', team: 'Operations', assignee: 'SK', person: 'Sana Khan', due: 'Today, 4:00 PM', age: '38 min ago', color: 'orange' },
  { id: 'OPS-1046', title: 'Customer refund reconciliation', description: 'Match disputed refunds with the settlement report.', type: 'Payment', priority: 'Medium', status: 'Open', team: 'Finance', assignee: null, person: null, due: 'Tomorrow', age: '1 hr ago', color: 'blue' },
  { id: 'OPS-1045', title: 'Update incident response runbook', description: 'Document escalation contacts and recovery steps.', type: 'Task', priority: 'Low', status: 'Resolved', team: 'Platform', assignee: 'RV', person: 'Riya Verma', due: 'Oct 20', age: '2 hrs ago', color: 'green' },
  { id: 'OPS-1044', title: 'Investigate failed settlement batch', description: 'Batch 7712 failed validation after the latest release.', type: 'Customer issue', priority: 'High', status: 'In Progress', team: 'Finance', assignee: 'DK', person: 'Dev Khanna', due: 'Today, 5:30 PM', age: '3 hrs ago', color: 'pink' },
  { id: 'OPS-1043', title: 'Approve vendor access renewal', description: 'Quarterly access review for the logistics partner.', type: 'Compliance', priority: 'Medium', status: 'Awaiting Approval', team: 'Operations', assignee: 'AM', person: 'Aarav Mehta', due: 'Oct 21', age: '4 hrs ago', color: 'teal' },
];

const API_URL = 'http://localhost:5000/api';

async function apiRequest(path, options = {}, token = '') {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }

  return data;
}

const formatStatus = status =>
  status
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const getInitials = name =>
  name
    ? name.split(' ').map(part => part[0]).join('').toUpperCase()
    : null;

const mapApiItem = item => ({
  id: item.code,
  dbId: item.id,
  version: item.version,
  teamId: item.teamId,
  title: item.title,
  description: item.description || '',
  type: item.type
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' '),
  priority: item.priority.charAt(0) + item.priority.slice(1).toLowerCase(),
  status: formatStatus(item.status),
  team: item.team?.name || 'Unknown team',
  assignee: getInitials(item.assignee?.name),
  person: item.assignee?.name || null,
  due: item.dueDate
    ? new Date(item.dueDate).toLocaleDateString()
    : 'Not set',
  age: new Date(item.updatedAt).toLocaleString(),
  color: 'blue',
});

const statusClass = s => s.toLowerCase().replaceAll(' ', '-');
function App() {
  const [items, setItems] = useState([]);
const [token, setToken] = useState('');
const [memberships, setMemberships] = useState([]);
const [loadingItems, setLoadingItems] = useState(true);
const [apiError, setApiError] = useState('');
  const [activeNav, setActiveNav] = useState('Overview');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All status');
  const [priority, setPriority] = useState('All priorities');
  const [showCreate, setShowCreate] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selected, setSelected] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [toast, setToast] = useState('');
  const [showProfile, setShowProfile] = useState(false);
useEffect(() => {
  let cancelled = false;

  async function connectToBackend() {
    try {
      setLoadingItems(true);
      setApiError('');

      const login = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'lead@newtonite.demo',
          password: 'Newtonite@123',
        }),
      });

      if (cancelled) return;

      setToken(login.token);
      setMemberships(login.memberships);

      const result = await apiRequest(
        '/items?page=1&pageSize=50',
        {},
        login.token
      );

      if (cancelled) return;

      setItems(result.items.map(mapApiItem));
    } catch (error) {
      if (!cancelled) {
        setApiError(error.message);
        console.error('Backend connection failed:', error);
      }
    } finally {
      if (!cancelled) setLoadingItems(false);
    }
  }

  connectToBackend();

  return () => {
    cancelled = true;
  };
}, []);
  const filtered = useMemo(() => items.filter(item => {
   const matchesQuery =
  `${item.title} ${item.id} ${item.team} ${item.type} ${item.description}`
    .toLowerCase()
    .includes(query.toLowerCase());
    const matchesStatus = status === 'All status' || item.status === status;
    const matchesPriority = priority === 'All priorities' || item.priority === priority;
    const matchesNav = activeNav === 'Assigned to me' ? item.assignee === 'AM'
      : activeNav === 'Unassigned urgent' ? !item.assignee && ['Critical', 'High'].includes(item.priority)
      : activeNav === 'Awaiting approval' ? item.status === 'Awaiting Approval' : true;
    return matchesQuery && matchesStatus && matchesPriority && matchesNav;
  }), [items, query, status, priority, activeNav]);

  const notify = msg => { setToast(msg); window.setTimeout(() => setToast(''), 2600); };

const createItem = async e => {
  e.preventDefault();

  if (!newTitle.trim()) return;

  if (!token) {
    notify('Please wait for the backend connection');
    return;
  }

  const teamId = memberships[0]?.teamId;

  if (!teamId) {
    notify('No team membership found');
    return;
  }

  try {
    const result = await apiRequest(
      '/items',
      {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle.trim(),
          description: 'New work item created from the dashboard.',
          type: 'TASK',
          priority: newPriority.toUpperCase(),
          teamId,
        }),
      },
      token
    );

    const createdItem = mapApiItem(result.item);

    setItems(old => [createdItem, ...old]);
    setNewTitle('');
    setNewPriority('Medium');
    setShowCreate(false);
    setActiveNav('Overview');
    notify('Work item saved to PostgreSQL');
  } catch (error) {
    notify(error.message || 'Could not create work item');
  }
};

 
const claimItem = async item => {
  if (!token) {
    notify('Please wait for the backend connection');
    return;
  }

  if (!item.dbId) {
    notify('This item has no database ID. Refresh the dashboard.');
    return;
  }

  try {
    const result = await apiRequest(
      `/items/${encodeURIComponent(item.dbId)}/claim`,
      { method: 'POST' },
      token
    );

    const claimedItem = mapApiItem(result.item);

    setItems(old =>
      old.map(x => x.dbId === claimedItem.dbId ? claimedItem : x)
    );

    setSelected(current =>
      current?.dbId === claimedItem.dbId ? claimedItem : current
    );

    notify(`${claimedItem.id} assigned to you`);
  } catch (error) {
    notify(error.message || 'Could not claim work item');
  }
};

  
const transition = async (item, next) => {
  if (!token || !item.dbId) {
    notify('Missing authentication or database ID');
    return;
  }

  const requestedStatus = next.toUpperCase().replaceAll(' ', '_');

  try {
    const result = await apiRequest(
      `/items/${encodeURIComponent(item.dbId)}/transition`,
      {
        method: 'POST',
        body: JSON.stringify({
          status: requestedStatus,
          expectedVersion: item.version ?? 0,
        }),
      },
      token
    );

    const updatedItem = {
      ...mapApiItem(result.item),
      version: result.item.version,
    };

    setItems(old =>
      old.map(x => x.dbId === updatedItem.dbId ? updatedItem : x)
    );

    setSelected(updatedItem);
    notify(`Status updated to ${updatedItem.status}`);
  } catch (error) {
    notify(error.message || 'Could not update status');
  }
};


  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Command size={21}/></div><div><strong>newtonite</strong><span>OPERATIONS</span></div><button className="mobile-close icon-btn" onClick={() => setMobileNav(false)}><X size={18}/></button></div>
      <div className="workspace-switch"><div className="workspace-icon">N</div><div className="workspace-copy"><b>Northstar workspace</b><span>Enterprise plan</span></div><ChevronDown size={15}/></div>
      <div className="nav-label">WORKSPACE</div>
      <nav className="nav-list">
        {[['Overview', LayoutDashboard], ['All work items', ListTodo], ['Assigned to me', ClipboardList], ['Unassigned urgent', AlertCircle], ['Awaiting approval', ShieldCheck]].map(([name, Icon]) =>
          <button key={name} className={`nav-link ${activeNav===name?'active':''}`} onClick={() => {setActiveNav(name);setMobileNav(false);}}>
            <Icon size={18}/><span>{name}</span>{name==='Awaiting approval' && <em>2</em>}
          </button>)}
      </nav>
      <div className="nav-label team-label">YOUR TEAMS <button className="tiny-plus" onClick={() => notify('Team management is coming next')}><Plus size={14}/></button></div>
      <div className="team-link"><span className="team-dot dot-purple"/>Platform Engineering<span className="team-count">8</span></div>
      <div className="team-link"><span className="team-dot dot-orange"/>Operations<span className="team-count">5</span></div>
      <div className="team-link"><span className="team-dot dot-blue"/>Finance<span className="team-count">3</span></div>
      <div className="sidebar-bottom">
        <div className="help-card"><div className="help-icon"><CircleHelp size={17}/></div><div><b>Need a hand?</b><span>Visit the help center</span></div><ArrowUpRight size={15}/></div>
        <button className="nav-link muted" onClick={() => notify('Settings will be available soon')}><Settings size={18}/><span>Settings</span></button>
        <div className="profile-row"><div className="avatar avatar-me">AM</div><div className="profile-copy"><b>Aarav Mehta</b><span>Team Lead</span></div><button className="icon-btn" onClick={() => setShowProfile(!showProfile)}><MoreHorizontal size={20}/></button>{showProfile && <div className="profile-pop"><b>Aarav Mehta</b><span>aarav@northstar.dev</span><button onClick={() => notify('Demo profile — sign out disabled')}><LogOut size={14}/> Sign out</button></div>}</div>
      </div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="topbar-left"><button className="icon-btn menu-btn" onClick={() => setMobileNav(true)}><Menu size={20}/></button><div className="breadcrumb">Workspace <span>/</span> <b>{activeNav}</b></div></div><div className="topbar-actions"><div className="search-global"><Search size={16}/><input placeholder="Search anything..." value={query} onChange={e=>setQuery(e.target.value)}/><kbd>⌘ K</kbd></div><button className="icon-btn notification-btn" onClick={() => setShowNotifications(!showNotifications)}><Bell size={19}/><i/></button>{showNotifications && <div className="notification-pop"><b>Notifications</b><p><span className="notif-dot"/>2 items are waiting for your approval.</p><p><span className="notif-dot orange"/>Payment gateway latency is high priority.</p></div>}<div className="top-avatar">AM</div></div></header>

      <div className="page-wrap">
        <section className="welcome-row"><div><div className="eyebrow"><span className="live-dot"/> MONDAY, OCTOBER 19, 2026</div><h1>Good morning, Aarav <span className="wave">✦</span></h1><p className="subtitle">Here’s what’s happening across your operations today.</p></div><button className="primary-btn" onClick={() => setShowCreate(true)}><Plus size={17}/> Create work item</button></section>

        <section className="hero-panel"><div className="hero-content"><div className="hero-tag"><Sparkles size={13}/> YOUR DAILY BRIEFING</div><h2>Keep the important things<br/><span>moving forward.</span></h2><p>You have <b>2 items awaiting approval</b> and one critical incident needs attention. Let’s make today count.</p><button className="hero-btn" onClick={() => {setActiveNav('Awaiting approval');document.querySelector('.table-card')?.scrollIntoView({behavior:'smooth'});}}>Review priorities <ArrowRight size={16}/></button></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit orbit-three"/><div className="art-core"><Activity size={34}/></div><div className="float-card float-card-top"><span className="float-check"><Check size={13}/></span><div><b>On track</b><small>Team performance</small></div><span className="float-metric">94%</span></div><div className="float-card float-card-bottom"><span className="float-pulse"/><div><b>Live operations</b><small>All systems monitored</small></div></div><div className="art-star star-a">✦</div><div className="art-star star-b">✧</div></div><div className="hero-glow"/></section>

        <section className="stats-grid">
          <StatCard icon={<ListTodo size={18}/>} label="Total work items" value={String(items.length+124)} change="+12.8%" note="vs. last week" trend="up" tone="purple" spark={[25,35,30,52,44,63,70]}/>
          <StatCard icon={<Activity size={18}/>} label="In progress" value={String(items.filter(x=>x.status==='In Progress').length+18)} change="+4.2%" note="vs. last week" trend="up" tone="blue" spark={[42,32,49,44,58,50,67]}/>
          <StatCard icon={<Clock3 size={18}/>} label="Needs attention" value={String(items.filter(x=>x.priority==='Critical'||x.status==='Awaiting Approval').length+3)} change="-8.1%" note="vs. last week" trend="down" tone="orange" spark={[65,60,68,42,48,33,28]}/>
          <StatCard icon={<CheckCircle2 size={18}/>} label="Resolved this week" value="86" change="+18.6%" note="vs. last week" trend="up" tone="green" spark={[20,28,24,45,39,63,82]}/>
        </section>

        <section className="lower-grid">
          <div className="table-card">
            <div className="section-heading"><div><div className="section-kicker">STAY IN CONTROL</div><h3>{activeNav==='Overview'?'Work items':activeNav}</h3><p>Track, prioritize and take action on your team’s work.</p></div><button className="secondary-btn" onClick={() => {setActiveNav('All work items');setStatus('All status');setPriority('All priorities');}}>View all <ArrowRight size={15}/></button></div>
            <div className="table-toolbar"><div className="table-tabs"><button className={status==='All status'?'selected':''} onClick={()=>setStatus('All status')}>All items <span>{items.length}</span></button><button className={status==='In Progress'?'selected':''} onClick={()=>setStatus('In Progress')}>In progress</button><button className={status==='Awaiting Approval'?'selected':''} onClick={()=>setStatus('Awaiting Approval')}>For approval</button></div><div className="filters"><label className="filter-select"><Filter size={14}/><select value={priority} onChange={e=>setPriority(e.target.value)}><option>All priorities</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select><ChevronDown size={13}/></label></div></div>
            <div className="work-list">
              <div className="work-header"><span>WORK ITEM</span><span>PRIORITY</span><span>STATUS</span><span>ASSIGNEE</span><span/></div>
              {filtered.length ? filtered.map(item=><div className="work-row" key={item.id} onClick={()=>setSelected(item)} role="button" tabIndex={0} onKeyDown={e=>e.key==='Enter'&&setSelected(item)}><div className="work-main"><div className={`item-type-icon ${item.color}`}>{item.type==='Incident'?<Zap size={15}/>:item.type==='Compliance'?<ShieldCheck size={15}/>:item.type==='Payment'?<Activity size={15}/>:<ClipboardList size={15}/>}</div><div className="work-copy"><b>{item.title}</b><span>{item.id} <i>·</i> {item.team}</span></div></div><div><span className={`priority ${item.priority.toLowerCase()}`}><span/>{item.priority}</span></div><div><span className={`status-pill ${statusClass(item.status)}`}><span/>{item.status}</span></div><div className="assignee-cell">{item.assignee?<><div className={`avatar avatar-${item.color}`}>{item.assignee}</div><span>{item.person?.split(' ')[0]}</span></>:<button className="assign-btn" onClick={e=>{e.stopPropagation();claimItem(item)}}><Plus size={13}/> Assign</button>}</div><button className="row-more icon-btn" onClick={e=>{e.stopPropagation();setSelected(item)}}><MoreHorizontal size={17}/></button></div>):<div className="empty-state"><Search size={22}/><b>No matching work items</b><span>Try changing your search or filters.</span></div>}
            </div>
            <div className="table-footer"><span>Showing <b>{filtered.length}</b> of <b>{items.length}</b> demo work items</span><div className="pagination"><button disabled>‹</button><button className="page-active">1</button><button onClick={()=>notify('Demo data: no more pages yet')}>2</button><button onClick={()=>notify('Demo data: no more pages yet')}>3</button><span>…</span><button onClick={()=>notify('Demo data: no more pages yet')}>›</button></div></div>
          </div>

          <aside className="right-column">
            <div className="attention-card"><div className="side-card-heading"><div><div className="section-kicker">DON’T MISS A BEAT</div><h3>Needs attention</h3></div><span className="count-badge">3</span></div><div className="attention-item"><div className="attention-icon critical"><AlertCircle size={17}/></div><div className="attention-copy"><b>Critical incident</b><span>Payment gateway latency spike</span><small>OPS-1048 · 12 min ago</small></div><button className="icon-btn" onClick={()=>setSelected(items.find(x=>x.id==='OPS-1048'))}><ArrowUpRight size={16}/></button></div><div className="attention-item"><div className="attention-icon approval"><ShieldCheck size={17}/></div><div className="attention-copy"><b>Approval required</b><span>Review KYC verification backlog</span><small>OPS-1047 · 38 min ago</small></div><button className="icon-btn" onClick={()=>setSelected(items.find(x=>x.id==='OPS-1047'))}><ArrowUpRight size={16}/></button></div><div className="attention-item"><div className="attention-icon overdue"><Clock3 size={17}/></div><div className="attention-copy"><b>Unassigned urgent task</b><span>Customer refund reconciliation</span><small>OPS-1046 · 1 hr ago</small></div><button className="icon-btn" onClick={()=>setSelected(items.find(x=>x.id==='OPS-1046'))}><ArrowUpRight size={16}/></button></div><button className="text-action" onClick={()=>setActiveNav('Unassigned urgent')}>See all attention items <ArrowRight size={14}/></button></div>
            <div className="activity-card"><div className="side-card-heading"><div><div className="section-kicker">TEAM PULSE</div><h3>Recent activity</h3></div><button className="icon-btn" onClick={()=>notify('Showing the latest demo activity')}><MoreHorizontal size={18}/></button></div><div className="activity-feed"><div className="feed-item"><div className="feed-avatar feed-purple">SK</div><div className="feed-content"><p><b>Sana Khan</b> moved <strong>OPS-1047</strong> to approval</p><span>12 minutes ago</span></div></div><div className="feed-item"><div className="feed-avatar feed-green"><Check size={14}/></div><div className="feed-content"><p><b>Riya Verma</b> resolved an incident</p><span>46 minutes ago</span></div></div><div className="feed-item"><div className="feed-avatar feed-blue">DK</div><div className="feed-content"><p><b>Dev Khanna</b> added a comment to <strong>OPS-1044</strong></p><span>1 hour ago</span></div></div></div><button className="text-action" onClick={()=>notify('Full activity history is coming with the API')}>View activity log <ArrowRight size={14}/></button></div>
            <div className="tip-card"><div className="tip-icon"><Sparkles size={16}/></div><div><b>Quick tip</b><p>Keep work moving. Claim unassigned urgent items before they become blockers.</p><button onClick={()=>setActiveNav('Unassigned urgent')}>Find urgent work <ArrowRight size={13}/></button></div></div>
          </aside>
        </section>
        <footer className="footer"><span>© 2026 Newtonite Operations</span><span><span className="footer-status"/> All systems operational</span><span>Built for teams that move work forward.</span></footer>
      </div>
    </main>

    {showCreate && <div className="modal-backdrop" onClick={()=>setShowCreate(false)}><form className="modal" onSubmit={createItem} onClick={e=>e.stopPropagation()}><div className="modal-top"><div><div className="section-kicker">NEW WORK ITEM</div><h2>Create something moving</h2><p>Give your team a clear next action.</p></div><button type="button" className="icon-btn" onClick={()=>setShowCreate(false)}><X size={19}/></button></div><label className="field-label">Title <span>*</span><input autoFocus value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="e.g. Investigate checkout errors" required maxLength={120}/></label><label className="field-label">Priority<select value={newPriority} onChange={e=>setNewPriority(e.target.value)}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></label><div className="modal-actions"><button type="button" className="secondary-btn" onClick={()=>setShowCreate(false)}>Cancel</button><button type="submit" className="primary-btn"><Plus size={16}/> Create item</button></div></form></div>}
    {selected && <div className="modal-backdrop" onClick={()=>setSelected(null)}><div className="detail-modal" onClick={e=>e.stopPropagation()}><div className="detail-top"><span className="detail-id">{selected.id}</span><button className="icon-btn" onClick={()=>setSelected(null)}><X size={19}/></button></div><h2>{selected.title}</h2><p className="detail-description">{selected.description}</p><div className="detail-chips"><span className={`priority ${selected.priority.toLowerCase()}`}><span/>{selected.priority} priority</span><span className={`status-pill ${statusClass(selected.status)}`}><span/>{selected.status}</span></div><div className="detail-meta"><div><span>TEAM</span><b>{selected.team}</b></div><div><span>ASSIGNEE</span><b>{selected.person||'Unassigned'}</b></div><div><span>DUE DATE</span><b><CalendarDays size={14}/>{selected.due}</b></div><div><span>TYPE</span><b>{selected.type}</b></div></div><div className="detail-activity"><h4><Activity size={16}/> Activity</h4><div className="detail-event"><div className="feed-avatar feed-purple">AM</div><div><p><b>Aarav Mehta</b> viewed this work item</p><span>Just now · Demo activity</span></div></div><div className="detail-event"><div className="event-line"/><div><p>Work item last updated</p><span>{selected.age}</span></div></div></div><div className="detail-actions">{!selected.assignee&&<button className="secondary-btn" onClick={()=>claimItem(selected)}><Users size={15}/> Claim item</button>}{selected.status==='Awaiting Approval'?<button className="primary-btn" onClick={()=>transition(selected,'Resolved')}><Check size={16}/> Approve & resolve</button>:selected.status==='Open'?<button className="primary-btn" onClick={()=>transition(selected,'In Progress')}><ArrowRight size={16}/> Start work</button>:selected.status==='In Progress'?<button className="primary-btn" onClick={()=>transition(selected,'Awaiting Approval')}><ShieldCheck size={16}/> Request approval</button>:<button className="secondary-btn" onClick={()=>setSelected(null)}>Close details</button>}</div><p className="demo-note"><CircleDot size={12}/> Demo UI · actions are currently stored in local state only.</p></div></div>}
    {toast && <div className="toast"><CheckCircle2 size={17}/>{toast}</div>}
  </div>;
}

function StatCard({icon,label,value,change,note,trend,tone,spark}) {
  return <div className="stat-card"><div className="stat-top"><div className={`stat-icon ${tone}`}>{icon}</div><button className="icon-btn stat-more"><MoreHorizontal size={17}/></button></div><div className="stat-label">{label}</div><div className="stat-bottom"><div><div className="stat-value">{value}</div><div className="stat-change"><span className={trend==='down'?'negative':''}>{trend==='down'?<ArrowDownRight size={13}/>:<ArrowUpRight size={13}/>} {change}</span><small>{note}</small></div></div><svg className={`sparkline ${tone}`} viewBox="0 0 100 38" preserveAspectRatio="none"><polyline points={spark.map((v,i)=>`${i*16},${35-v*.36}`).join(' ')} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="96" cy={35-spark[spark.length-1]*.36} r="3" fill="currentColor"/></svg></div></div>;
}

createRoot(document.getElementById('root')).render(<App/>);
