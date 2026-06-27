import { useEffect, useMemo, useState } from 'react'
import './index.css'
import ChatWidget from './ChatWidget'

const demoUsers = {
  admin: {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    organization: { id: 1, name: 'Acme Corp' },
  },
  agent: {
    id: 2,
    name: 'Meera Agent',
    email: 'agent1@example.com',
    role: 'agent',
    organization: { id: 1, name: 'Acme Corp' },
  },
  customer: {
    id: 4,
    name: 'Nisha Customer',
    email: 'customer1@example.com',
    role: 'customer',
    organization: { id: 1, name: 'Acme Corp' },
  },
}

const seedTickets = [
  {
    id: 101,
    subject: 'Cannot access billing page',
    description: 'The billing page keeps loading forever after the last invoice update. Customer is blocked from downloading invoices before finance close.',
    status: 'open',
    priority: 'critical',
    tags: ['billing', 'login'],
    requester: demoUsers.customer,
    requester_id: 4,
    assignee: null,
    assignee_id: null,
    comments_count: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    sla: { breached: false, minutes_remaining: 42 },
    comments: [
      { id: 1, type: 'public_reply', body: 'I tried Chrome and mobile Safari. Both freeze on the invoice screen.', user: demoUsers.customer, created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString() },
      { id: 2, type: 'internal_note', body: 'Looks tied to invoice PDF generation after tax recalculation. Checking logs before replying.', user: demoUsers.agent, created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString() },
    ],
    activities: [
      { id: 1, action: 'created', description: 'Ticket created with priority urgent', user: demoUsers.customer, created_at: new Date(Date.now() - 1000 * 60 * 44).toISOString() },
      { id: 2, action: 'commented', description: 'Added an internal note', user: demoUsers.agent, created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString() },
    ],
  },
  {
    id: 102,
    subject: 'Webhook retry failures',
    description: 'Webhook events are not retrying after a temporary partner outage. Orders are visible but downstream fulfillment never receives the replay.',
    status: 'open',
    priority: 'high',
    tags: ['integrations'],
    requester: { ...demoUsers.customer, id: 5, name: 'Karan Customer' },
    requester_id: 5,
    assignee: demoUsers.agent,
    assignee_id: 2,
    comments_count: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
    sla: { breached: false, minutes_remaining: 124 },
    comments: [
      { id: 3, type: 'public_reply', body: 'Partner dashboard shows the outage recovered at 11:20, but retries did not fire.', user: { ...demoUsers.customer, id: 5, name: 'Karan Customer' }, created_at: new Date(Date.now() - 1000 * 60 * 70).toISOString() },
    ],
    activities: [
      { id: 3, action: 'assigned', description: 'Assigned to Meera Agent', user: demoUsers.admin, created_at: new Date(Date.now() - 1000 * 60 * 82).toISOString() },
    ],
  },
  {
    id: 103,
    subject: 'Mobile app crash on checkout',
    description: 'Checkout crashes on Android after applying a coupon. Four customers reported it in the last hour.',
    status: 'open',
    priority: 'critical',
    tags: ['mobile', 'checkout'],
    requester: demoUsers.customer,
    requester_id: 4,
    assignee: { ...demoUsers.agent, id: 3, name: 'Rohan Agent' },
    assignee_id: 3,
    comments_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    sla: { breached: true, minutes_remaining: -35 },
    comments: [
      { id: 4, type: 'public_reply', body: 'The crash happens after coupon SAVE20 is applied.', user: demoUsers.customer, created_at: new Date(Date.now() - 1000 * 60 * 170).toISOString() },
      { id: 5, type: 'public_reply', body: 'Thanks, we reproduced it and are preparing a rollback for the coupon rule.', user: { ...demoUsers.agent, id: 3, name: 'Rohan Agent' }, created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
    ],
    activities: [
      { id: 4, action: 'status_changed', description: 'Status updated to open', user: { ...demoUsers.agent, id: 3, name: 'Rohan Agent' }, created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString() },
      { id: 5, action: 'sla_breached', description: 'SLA timer breached', user: null, created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString() },
    ],
  },
  {
    id: 104,
    subject: 'CSV export missing rows',
    description: 'The weekly CSV export is missing older resolved conversations when finance filters by this quarter.',
    status: 'in_progress',
    priority: 'high',
    tags: ['reports'],
    requester: { ...demoUsers.customer, id: 5, name: 'Karan Customer' },
    requester_id: 5,
    assignee: demoUsers.agent,
    assignee_id: 2,
    comments_count: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 260).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    sla: { breached: false, minutes_remaining: 208 },
    comments: [
      { id: 6, type: 'public_reply', body: 'The export should include resolved tickets from April onward.', user: { ...demoUsers.customer, id: 5, name: 'Karan Customer' }, created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString() },
    ],
    activities: [
      { id: 6, action: 'status_changed', description: 'Status updated to pending', user: demoUsers.agent, created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
    ],
  },
  {
    id: 105,
    subject: 'Customer portal typo',
    description: 'There is a typo on the customer portal confirmation screen after a ticket is submitted.',
    status: 'resolved',
    priority: 'low',
    tags: ['portal'],
    requester: demoUsers.customer,
    requester_id: 4,
    assignee: demoUsers.agent,
    assignee_id: 2,
    comments_count: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 900).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
    sla: { breached: false, minutes_remaining: 4200 },
    comments: [
      { id: 7, type: 'public_reply', body: 'Fixed and shipped. The confirmation copy now reads correctly.', user: demoUsers.agent, created_at: new Date(Date.now() - 1000 * 60 * 130).toISOString() },
    ],
    activities: [
      { id: 7, action: 'status_changed', description: 'Status updated to resolved', user: demoUsers.agent, created_at: new Date(Date.now() - 1000 * 60 * 130).toISOString() },
    ],
  },
]

const statusOptions = ['all', 'open', 'in_progress', 'resolved', 'closed']
const priorityOptions = ['all', 'critical', 'high', 'medium', 'low']
const assigneeOptions = ['all', 'mine', 'unassigned']
const apiUrl = 'https://forge2-prashanthackathon-production.up.railway.app/api'

function App() {
  const [apiMode, setApiMode] = useState(localStorage.getItem('pulsedesk-api-mode') || 'demo')
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('pulsedesk-user') || 'null'))
  const [token, setToken] = useState(localStorage.getItem('pulsedesk-token'))
  const [tickets, setTickets] = useState(seedTickets)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [metrics, setMetrics] = useState(calculateMetrics(seedTickets))
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', assignee: 'all', search: '' })
  const [replyBody, setReplyBody] = useState('')
  const [replyType, setReplyType] = useState('public_reply')
  const [loginForm, setLoginForm] = useState({ email: 'admin@example.com', password: 'password', name: '', organization_name: '' })
  const [isRegistering, setIsRegistering] = useState(false)
  const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'medium', tags: '' })
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [notice, setNotice] = useState('')
  const [activeView, setActiveView] = useState('inbox')
  const [theme, setTheme] = useState(localStorage.getItem('pulsedesk-theme') || 'light')

  const usingApi = apiMode === 'api'

  useEffect(() => {
    localStorage.setItem('pulsedesk-api-mode', apiMode)
  }, [apiMode])

  useEffect(() => {
    localStorage.setItem('pulsedesk-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!user || !token) return
    if (usingApi) {
      fetchUser()
      fetchTickets()
      fetchMetrics()
    } else {
      setMetrics(calculateMetrics(visibleByRole(seedTickets, user)))
      setTickets(visibleByRole(seedTickets, user))
    }
  }, [user, token, apiMode])

  useEffect(() => {
    if (!usingApi || !token) return
    fetchTickets()
  }, [filters.status, filters.priority, filters.assignee])

  const filteredTickets = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    return tickets.filter((ticket) => {
      const assigneeMatch = filters.assignee === 'all'
        || (filters.assignee === 'mine' && ticket.assignee_id === user?.id)
        || (filters.assignee === 'unassigned' && !ticket.assignee_id)
      const statusMatch = filters.status === 'all' || ticket.status === filters.status
      const priorityMatch = filters.priority === 'all' || ticket.priority === filters.priority
      const searchMatch = !search
        || ticket.subject.toLowerCase().includes(search)
        || ticket.description.toLowerCase().includes(search)
        || (ticket.tags || []).join(' ').toLowerCase().includes(search)
      return assigneeMatch && statusMatch && priorityMatch && searchMatch
    })
  }, [tickets, filters, user])

  const activeTicket = selectedTicket

  async function fetchMetrics() {
    const data = await apiGet('/dashboard/metrics')
    if (data) setMetrics(data)
  }

  async function fetchUser() {
    const data = await apiGet('/me')
    if (data) {
      setUser(data)
      localStorage.setItem('pulsedesk-user', JSON.stringify(data))
    }
  }

  async function fetchTickets() {
    const params = new URLSearchParams()
    if (filters.status !== 'all') params.set('status', filters.status)
    if (filters.priority !== 'all') params.set('priority', filters.priority)
    if (filters.assignee !== 'all') params.set('assignee', filters.assignee)
    const data = await apiGet(`/tickets${params.toString() ? `?${params}` : ''}`)
    if (data) setTickets(data)
  }

  async function apiGet(path) {
    try {
      const response = await fetch(`${apiUrl}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Request failed')
      return await response.json()
    } catch (error) {
      setNotice('API unavailable. Switched to seeded demo data for the live walkthrough.')
      setApiMode('demo')
      setTickets(visibleByRole(seedTickets, user || demoUsers.admin))
      return null
    }
  }

  async function login(event) {
    event.preventDefault()
    setNotice('')

    if (!usingApi) {
      const demoUser = Object.values(demoUsers).find((item) => item.email === loginForm.email) || demoUsers.admin
      setUser(demoUser)
      setToken('demo-token')
      localStorage.setItem('pulsedesk-token', 'demo-token')
      localStorage.setItem('pulsedesk-user', JSON.stringify(demoUser))
      setTickets(visibleByRole(seedTickets, demoUser))
      setMetrics(calculateMetrics(visibleByRole(seedTickets, demoUser)))
      return
    }

    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      })
      if (!response.ok) throw new Error('Login failed')
      const data = await response.json()
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('pulsedesk-token', data.token)
      localStorage.setItem('pulsedesk-user', JSON.stringify(data.user))
    } catch (error) {
      setNotice('API login failed. Use demo mode or start the Laravel API from README steps.')
    }
  }

  async function registerUser(event) {
    event.preventDefault()
    setNotice('')
    if (!usingApi) {
      setNotice('Registration requires Laravel API mode.')
      return
    }

    try {
      const response = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: loginForm.name,
            email: loginForm.email,
            password: loginForm.password,
            organization_name: loginForm.organization_name
        }),
      })
      if (!response.ok) throw new Error('Registration failed. Check if email is already taken.')
      const data = await response.json()
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('pulsedesk-token', data.token)
      localStorage.setItem('pulsedesk-user', JSON.stringify(data.user))
    } catch (error) {
      setNotice(error.message)
    }
  }

  function logout() {
    setUser(null)
    setToken(null)
    setSelectedTicket(null)
    localStorage.removeItem('pulsedesk-token')
    localStorage.removeItem('pulsedesk-user')
  }

  async function viewTicket(ticket) {
    if (!usingApi) {
      setSelectedTicket(ticket)
      return
    }
    const data = await apiGet(`/tickets/${ticket.id}`)
    if (data) setSelectedTicket(data)
  }

  async function createTicket(event) {
    event.preventDefault()
    const payload = {
      ...newTicket,
      tags: newTicket.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    }

    if (!usingApi) {
      const ticket = {
        ...payload,
        id: Math.max(...tickets.map((item) => item.id)) + 1,
        status: 'open',
        requester: user,
        requester_id: user.id,
        assignee: null,
        assignee_id: null,
        comments_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sla: { breached: false, minutes_remaining: payload.priority === 'critical' ? 60 : payload.priority === 'high' ? 240 : payload.priority === 'medium' ? 720 : 1440 },
        comments: [],
        activities: [{ id: Date.now(), action: 'created', description: `Ticket created with priority ${payload.priority}`, user, created_at: new Date().toISOString() }],
      }
      const next = [ticket, ...tickets]
      setTickets(next)
      setMetrics(calculateMetrics(next))
      setNewTicket({ subject: '', description: '', priority: 'medium', tags: '' })
      setShowNewTicket(false)
      return
    }

    const data = await writeApi('/tickets', 'POST', payload)
    if (data) {
      setTickets([data, ...tickets])
      setShowNewTicket(false)
      setNewTicket({ subject: '', description: '', priority: 'medium', tags: '' })
      fetchMetrics()
    }
  }

  async function updateTicket(id, patch) {
    if (!usingApi) {
      const next = tickets.map((ticket) => {
        if (ticket.id !== id) return ticket
        return {
          ...ticket,
          ...patch,
          activities: [
            ...(ticket.activities || []),
            { id: Date.now(), action: 'updated', description: 'Ticket fields updated', user, created_at: new Date().toISOString() },
          ],
        }
      })
      setTickets(next)
      setMetrics(calculateMetrics(next))
      if (selectedTicket && selectedTicket.id === id) setSelectedTicket(next.find(t => t.id === id))
      return
    }

    const data = await writeApi(`/tickets/${id}`, 'PATCH', patch)
    if (data) {
      setTickets(tickets.map((ticket) => (ticket.id === id ? data : ticket)))
      setSelectedTicket(prev => prev ? { ...prev, ...data, comments: prev.comments, activities: prev.activities } : data)
      fetchMetrics()
    }
  }

  async function claimTicket() {
    if (!activeTicket) return
    if (!usingApi) {
      await updateTicket(activeTicket.id, { assignee: user, assignee_id: user.id })
      return
    }
    const data = await writeApi(`/tickets/${activeTicket.id}/assign`, 'POST', {})
    if (data) {
      setTickets(tickets.map((ticket) => (ticket.id === data.id ? data : ticket)))
      setSelectedTicket(prev => prev ? { ...prev, ...data, comments: prev.comments, activities: prev.activities } : data)
    }
  }

  async function addComment(event) {
    event.preventDefault()
    if (!replyBody.trim() || !activeTicket) return

    const payload = { body: replyBody.trim(), type: replyType }
    if (!usingApi) {
      const comment = { id: Date.now(), ...payload, user, created_at: new Date().toISOString() }
      const next = tickets.map((ticket) => ticket.id === activeTicket.id
        ? {
          ...ticket,
          comments: [...(ticket.comments || []), comment],
          comments_count: (ticket.comments_count || 0) + 1,
          activities: [
            ...(ticket.activities || []),
            { id: Date.now() + 1, action: 'commented', description: `Added a ${replyType.replace('_', ' ')}`, user, created_at: new Date().toISOString() },
          ],
        }
        : ticket)
      setTickets(next)
      setSelectedTicket(next.find((ticket) => ticket.id === activeTicket.id))
      setReplyBody('')
      return
    }

    const data = await writeApi(`/tickets/${activeTicket.id}/comments`, 'POST', payload)
    if (data) {
      setSelectedTicket({
        ...activeTicket,
        comments: [...(activeTicket.comments || []), data],
      })
      setReplyBody('')
    }
  }

  async function writeApi(path, method, body) {
    try {
      const response = await fetch(`${apiUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      if (!response.ok) throw new Error('Request failed')
      return await response.json()
    } catch (error) {
      setNotice('API write failed. The demo state is still available for walkthrough.')
      return null
    }
  }

  if (!user || !token) {
    return (
      <main className="login-shell">
        <section className="login-panel">
          <div>
            <p className="eyebrow">Forge 2 Helpdesk</p>
            <h1>PulseDesk</h1>
            <p className="login-copy">Multi-tenant support desk for agents, admins, and customers.</p>
          </div>

          <div className="mode-toggle" aria-label="Data source">
            <button className={apiMode === 'demo' ? 'active' : ''} onClick={() => setApiMode('demo')} type="button">Demo</button>
            <button className={apiMode === 'api' ? 'active' : ''} onClick={() => setApiMode('api')} type="button">Laravel API</button>
          </div>

          <form onSubmit={isRegistering ? registerUser : login}>
              {isRegistering && (
                <>
                  <label>
                    Name
                    <input value={loginForm.name} onChange={(event) => setLoginForm({ ...loginForm, name: event.target.value })} type="text" required />
                  </label>
                  <label>
                    Organization Name
                    <input value={loginForm.organization_name} onChange={(event) => setLoginForm({ ...loginForm, organization_name: event.target.value })} type="text" required />
                  </label>
                </>
              )}
              <label>
                Email
                <input value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} type="email" required />
              </label>
              <label>
                Password
                <input value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} type="password" required />
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="primary-button" type="submit" style={{ flex: 1 }}>{isRegistering ? 'Create Account' : 'Sign in'}</button>
                <button className="ghost-button" type="button" onClick={() => { setIsRegistering(!isRegistering); setNotice('') }} style={{ flex: 1 }}>{isRegistering ? 'Cancel' : 'Register'}</button>
              </div>
            </form>

          <div className="demo-logins">
            <button type="button" onClick={() => setLoginForm({ email: 'admin@example.com', password: 'password' })}>Admin</button>
            <button type="button" onClick={() => setLoginForm({ email: 'agent1@example.com', password: 'password' })}>Agent</button>
            <button type="button" onClick={() => setLoginForm({ email: 'customer1@example.com', password: 'password' })}>Customer</button>
          </div>
          {notice && <p className="notice">{notice}</p>}
        </section>
      </main>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark">P</span>
          <div>
            <strong>PulseDesk</strong>
            <small>{user.organization?.name || 'Workspace'}</small>
          </div>
        </div>
        <nav>
          <button className={activeView === 'inbox' ? 'nav-active' : ''} onClick={() => { setActiveView('inbox'); setFilters({ status: 'all', priority: 'all', assignee: 'all', search: '' }); setSelectedTicket(null); }} type="button">Inbox</button>
          <button className={activeView === 'mine' ? 'nav-active' : ''} onClick={() => { setActiveView('mine'); setFilters({ ...filters, assignee: 'mine' }); setSelectedTicket(null); }} type="button">My tickets</button>
          <button className={activeView === 'customers' ? 'nav-active' : ''} onClick={() => setActiveView('customers')} type="button">Customers</button>
          <button className={activeView === 'slas' ? 'nav-active' : ''} onClick={() => setActiveView('slas')} type="button">SLA Policies</button>
          <button className={activeView === 'audit' ? 'nav-active' : ''} onClick={() => setActiveView('audit')} type="button">Audit</button>
        </nav>
        <div className="tenant-proof">
          <span>Tenant scoped</span>
          <strong>{user.role}</strong>
          <small>All data is filtered from the authenticated organization.</small>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Support operations</p>
            <h2>{activeTicket ? activeTicket.subject : 'Ticket command center'}</h2>
          </div>
          <div className="top-actions">
            <span className="api-pill">{usingApi ? 'Laravel API' : 'Seeded demo'}</span>
            <button className="ghost-button" style={{ padding: '6px' }} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title="Toggle Theme">
               {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button className="ghost-button" style={{ padding: '6px', position: 'relative' }} onClick={() => setActiveView('audit')} title="Notifications">
               🔔<span style={{ position: 'absolute', top: '2px', right: '4px', width: '8px', height: '8px', background: 'red', borderRadius: '50%' }}></span>
            </button>
            <span className="user-pill">{user.name}</span>
            <button className="ghost-button" onClick={logout} type="button">Logout</button>
          </div>
        </header>

        {notice && <p className="notice inline-notice">{notice}</p>}

        {activeView === 'customers' ? (
          <section className="customers-view">
            <h3>Customers Directory</h3>
            <p>List of customers for {user.organization?.name || 'your workspace'}.</p>
            <div className="grid">
               <div className="metric neutral"><span>Nisha Customer</span><strong>customer1@example.com</strong></div>
               <div className="metric neutral"><span>Karan Customer</span><strong>customer2@example.com</strong></div>
            </div>
          </section>
        ) : activeView === 'audit' ? (
          <section className="audit-view">
            <h3>Global Audit Log</h3>
            <p>Recent activity across the organization.</p>
            <div className="activity-panel">
               {(usingApi && metrics?.recent_activity ? metrics.recent_activity : tickets.flatMap(t => t.activities || []).sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)).map(act => (
                 <div className="activity-item" key={act.id}><span/><div><strong>{act.user?.name || 'System'}</strong><p>{act.description || act.action}</p><small>{formatDate(act.created_at)}</small></div></div>
               ))}
            </div>
          </section>
        ) : activeView === 'slas' ? (
          <section className="customers-view">
             <h3>SLA Policies</h3>
             <p>Enterprise service level agreements defining expected response times.</p>
             <div className="grid">
                <div className="metric neutral"><span>Priority: Critical</span><strong>1 Hour</strong></div>
                <div className="metric neutral"><span>Priority: High</span><strong>4 Hours</strong></div>
                <div className="metric neutral"><span>Priority: Medium</span><strong>12 Hours</strong></div>
                <div className="metric neutral"><span>Priority: Low</span><strong>24 Hours</strong></div>
             </div>
          </section>
        ) : !activeTicket ? (
          <>
            <section className="metrics-grid">
              <button className="metric-btn" onClick={() => setFilters({ ...filters, status: 'all', priority: 'all' })}><Metric label="Total Tickets" value={metrics.total_tickets} tone="neutral" /></button>
              <button className="metric-btn" onClick={() => setFilters({ ...filters, status: 'open' })}><Metric label="Open Tickets" value={metrics.open_tickets} tone="blue" /></button>
              <button className="metric-btn" onClick={() => setFilters({ ...filters, status: 'closed' })}><Metric label="Closed Tickets" value={metrics.closed_tickets} tone="green" /></button>
              <button className="metric-btn" onClick={() => setFilters({ ...filters, assignee: 'mine' })}><Metric label="Assigned Tickets" value={metrics.assigned_tickets} tone="amber" /></button>
            </section>
            
            {metrics.total_tickets > 0 && (
              <div style={{ margin: '0 0 24px', background: 'var(--bg-secondary, #fff)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color, #cad4df)' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--text-secondary, #5c6b7d)', textTransform: 'uppercase' }}>Ticket Distribution Graph</h4>
                <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', background: '#e2e8f0' }}>
                   <div style={{ width: `${(metrics.open_tickets / metrics.total_tickets) * 100}%`, background: '#3b82f6' }} title={`Open: ${metrics.open_tickets}`} />
                   <div style={{ width: `${(metrics.closed_tickets / metrics.total_tickets) * 100}%`, background: '#10b981' }} title={`Closed: ${metrics.closed_tickets}`} />
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary, #5c6b7d)' }}>
                   <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{width: 8, height: 8, background: '#3b82f6', borderRadius: '50%'}}/> Open ({Math.round((metrics.open_tickets / metrics.total_tickets) * 100)}%)</span>
                   <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{width: 8, height: 8, background: '#10b981', borderRadius: '50%'}}/> Closed ({Math.round((metrics.closed_tickets / metrics.total_tickets) * 100)}%)</span>
                </div>
              </div>
            )}

            <section className="toolbar">
              <input className="search" placeholder="Search subject, body, tags" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
              <Select label="Status" value={filters.status} options={statusOptions} onChange={(status) => setFilters({ ...filters, status })} />
              <Select label="Priority" value={filters.priority} options={priorityOptions} onChange={(priority) => setFilters({ ...filters, priority })} />
              {user.role !== 'customer' && <Select label="Queue" value={filters.assignee} options={assigneeOptions} onChange={(assignee) => setFilters({ ...filters, assignee })} />}
              <button className="primary-button compact" onClick={() => setShowNewTicket(true)} type="button">New ticket</button>
            </section>

            <section className="ticket-list">
              {filteredTickets.map((ticket) => (
                <button className="ticket-row" key={ticket.id} onClick={() => viewTicket(ticket)} type="button">
                  <div className="ticket-main">
                    <div className="row-title">
                      <span className={`status-dot ${ticket.status}`} />
                      <strong>{ticket.subject}</strong>
                      <Badge value={ticket.status} />
                      <Badge value={ticket.priority} priority />
                    </div>
                    <p>{ticket.description}</p>
                    <div className="tag-list">
                      {(ticket.tags || []).map((tag) => <span key={tag} onClick={(e) => { e.stopPropagation(); setFilters({ ...filters, search: tag }); }}>{tag}</span>)}
                    </div>
                  </div>
                  <div className="ticket-meta">
                    <strong>{formatSla(ticket.sla)}</strong>
                    <small>{ticket.assignee?.name || 'Unassigned'}</small>
                    <small>{ticket.comments_count || ticket.comments?.length || 0} replies</small>
                  </div>
                </button>
              ))}
            </section>
          </>
        ) : (
          <TicketDetail
            ticket={activeTicket}
            user={user}
            replyBody={replyBody}
            replyType={replyType}
            setReplyBody={setReplyBody}
            setReplyType={setReplyType}
            onBack={() => setSelectedTicket(null)}
            onClaim={claimTicket}
            onComment={addComment}
            onUpdate={updateTicket}
          />
        )}
      </main>

      <ChatWidget />

      {showNewTicket && (
        <div className="modal-backdrop" role="presentation">
          <form className="modal" onSubmit={createTicket}>
            <header>
              <h3>New support ticket</h3>
              <button type="button" onClick={() => setShowNewTicket(false)}>Close</button>
            </header>
            <label>Subject<input value={newTicket.subject} onChange={(event) => setNewTicket({ ...newTicket, subject: event.target.value })} required /></label>
            <label>Description<textarea value={newTicket.description} onChange={(event) => setNewTicket({ ...newTicket, description: event.target.value })} required /></label>
            <label>Priority<select value={newTicket.priority} onChange={(event) => setNewTicket({ ...newTicket, priority: event.target.value })}>{priorityOptions.filter((item) => item !== 'all').map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label>Tags<input value={newTicket.tags} onChange={(event) => setNewTicket({ ...newTicket, tags: event.target.value })} placeholder="billing, login" /></label>
            <button className="primary-button" type="submit">Create ticket</button>
          </form>
        </div>
      )}
    </div>
  )
}

function TicketDetail({ ticket, user, replyBody, replyType, setReplyBody, setReplyType, onBack, onClaim, onComment, onUpdate }) {
  return (
    <section className="detail-layout">
      <div className="detail-main">
        <button className="back-button" onClick={onBack} type="button">Back to inbox</button>
        <article className="ticket-card">
          <div className="detail-head">
            <div>
              <div className="row-title"><Badge value={ticket.status} /><Badge value={ticket.priority} priority /><span className={ticket.sla?.breached ? 'sla breached' : 'sla'}>{formatSla(ticket.sla)}</span></div>
              <h3>{ticket.subject}</h3>
              <p>{ticket.description}</p>
            </div>
            {!ticket.assignee_id && user.role !== 'customer' && <button className="primary-button compact" onClick={onClaim} type="button">Claim</button>}
          </div>
          <dl className="field-grid">
            <div><dt>Requester</dt><dd>{ticket.requester?.name || 'Unknown'}</dd></div>
            <div><dt>Assignee</dt><dd>{ticket.assignee?.name || 'Unassigned'}</dd></div>
            <div><dt>Created</dt><dd>{formatDate(ticket.created_at)}</dd></div>
            <div><dt>Tags</dt><dd>{(ticket.tags || []).join(', ') || 'none'}</dd></div>
          </dl>
        </article>

        {user.role !== 'customer' && (
          <div className="admin-strip">
            <Select label="Status" value={ticket.status} options={statusOptions.filter((item) => item !== 'all')} onChange={(status) => onUpdate(ticket.id, { status })} />
            <Select label="Priority" value={ticket.priority} options={priorityOptions.filter((item) => item !== 'all')} onChange={(priority) => onUpdate(ticket.id, { priority })} />
          </div>
        )}

        <section className="conversation">
          <h3>Conversation</h3>
          {(ticket.comments || []).map((comment) => (
            <article className={comment.type === 'internal_note' ? 'comment internal' : 'comment'} key={comment.id}>
              <header><strong>{comment.user?.name || 'System'}</strong><small>{formatDate(comment.created_at)}</small></header>
              <p>{comment.body}</p>
            </article>
          ))}
          <form className="reply-box" onSubmit={onComment}>
            <textarea value={replyBody} onChange={(event) => setReplyBody(event.target.value)} placeholder="Write a clear update for this ticket" required />
            <div>
              {user.role !== 'customer' && <select value={replyType} onChange={(event) => setReplyType(event.target.value)}><option value="public_reply">Public reply</option><option value="internal_note">Internal note</option></select>}
              <button className="primary-button compact" type="submit">Send reply</button>
            </div>
          </form>
        </section>
      </div>

      <aside className="activity-panel">
        <h3>Activity log</h3>
        {(ticket.activities || []).map((activity) => (
          <div className="activity-item" key={activity.id}>
            <span />
            <div><strong>{activity.user?.name || 'System'}</strong><p>{activity.description}</p><small>{formatDate(activity.created_at)}</small></div>
          </div>
        ))}
      </aside>
    </section>
  )
}

function Metric({ label, value, tone }) {
  return <article className={`metric ${tone}`}><span>{label}</span><strong>{value ?? 0}</strong></article>
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="select-label">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function Badge({ value, priority = false }) {
  return <span className={`badge ${priority ? `priority-${value}` : value}`}>{value}</span>
}

function visibleByRole(tickets, currentUser) {
  if (currentUser.role === 'customer') return tickets.filter((ticket) => ticket.requester_id === currentUser.id).map(stripInternalNotes)
  return tickets
}

function stripInternalNotes(ticket) {
  return { ...ticket, comments: (ticket.comments || []).filter((comment) => comment.type !== 'internal_note') }
}

function calculateMetrics(items) {
  return {
    total_tickets: items.length,
    open_tickets: items.filter((ticket) => ticket.status === 'open').length,
    closed_tickets: items.filter((ticket) => ['resolved', 'closed'].includes(ticket.status)).length,
    assigned_tickets: items.filter((ticket) => ticket.assignee_id).length,
  }
}

function formatSla(sla) {
  if (!sla) return 'No SLA'
  if (sla.breached) return `Breached ${Math.abs(Math.round(sla.minutes_remaining || 0))}m`
  const minutes = Math.max(0, Math.round(sla.minutes_remaining || 0))
  if (minutes >= 1440) return `${Math.round(minutes / 1440)}d left`
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m left`
  return `${minutes}m left`
}

function formatDate(value) {
  if (!value) return 'now'
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default App
