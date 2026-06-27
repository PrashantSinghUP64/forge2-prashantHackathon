import { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [tickets, setTickets] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyBody, setReplyBody] = useState('')
  const [replyType, setReplyType] = useState('public_reply')

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

  useEffect(() => {
    if (token) {
      fetchUser()
      fetchTickets()
      fetchMetrics()
    }
  }, [token])

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${apiUrl}/dashboard/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setMetrics(await res.json())
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchUser = async () => {
    try {
      const res = await fetch(`${apiUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setUser(await res.json())
      } else {
        logout()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${apiUrl}/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setTickets(await res.json())
      }
    } catch (e) {
      console.error(e)
    }
  }

  const login = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (res.ok) {
        const data = await res.json()
        setToken(data.token)
        localStorage.setItem('token', data.token)
      } else {
        alert('Login failed')
      }
    } catch (e) {
      console.error(e)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setTickets([])
    localStorage.removeItem('token')
  }

  const viewTicket = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setSelectedTicket(await res.json())
      }
    } catch (e) {
      console.error(e)
    }
  }

  const addComment = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${apiUrl}/tickets/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ body: replyBody, type: replyType })
      })
      if (res.ok) {
        const comment = await res.json()
        setSelectedTicket({
          ...selectedTicket,
          comments: [...selectedTicket.comments, comment]
        })
        setReplyBody('')
      }
    } catch (e) {
      console.error(e)
    }
  }

  const claimTicket = async () => {
    try {
      const res = await fetch(`${apiUrl}/tickets/${selectedTicket.id}/assign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const updated = await res.json()
        setSelectedTicket({...selectedTicket, assignee: user})
        fetchTickets()
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <form onSubmit={login} className="bg-white p-8 rounded-xl shadow-2xl w-96">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-brand-600">PulseDesk</h1>
            <p className="text-slate-500 mt-2">Sign in to your workspace</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition" required />
            </div>
            <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 rounded-lg transition">Sign In</button>
          </div>
          <div className="mt-6 text-sm text-center text-slate-500">
            Hint: admin@example.com / password
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setSelectedTicket(null)}>
            <h1 className="text-xl font-bold text-brand-600">PulseDesk</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-600">{user?.name} ({user?.role})</span>
            <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-700 transition">Logout</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        {!selectedTicket ? (
          <div className="w-full space-y-6">
            
            {/* Dashboard Metrics (SHOULD Tier) */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <p className="text-sm font-medium text-slate-500">Total Tickets</p>
                  <p className="text-2xl font-bold text-slate-900">{metrics.total_tickets}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <p className="text-sm font-medium text-slate-500">Open Tickets</p>
                  <p className="text-2xl font-bold text-brand-600">{metrics.open_tickets}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <p className="text-sm font-medium text-slate-500">Urgent Priority</p>
                  <p className="text-2xl font-bold text-rose-600">{metrics.urgent_tickets}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4 bg-red-50">
                  <p className="text-sm font-medium text-red-600">SLA Breached</p>
                  <p className="text-2xl font-bold text-red-700">{metrics.sla_breached}</p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-slate-900">Recent Tickets</h2>
              <button className="bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 px-4 rounded-lg transition shadow-sm">
                New Ticket
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <ul className="divide-y divide-slate-200">
                {tickets.map(ticket => (
                  <li key={ticket.id} onClick={() => viewTicket(ticket.id)} className="p-4 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between group">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ticket.status === 'open' ? 'bg-amber-100 text-amber-800' :
                          ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {ticket.status.toUpperCase()}
                        </span>
                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition">{ticket.subject}</h3>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-1">{ticket.description}</p>
                    </div>
                    <div className="text-sm text-slate-400">
                      #{ticket.id}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl space-y-6">
            <button onClick={() => setSelectedTicket(null)} className="text-sm text-slate-500 hover:text-slate-700 font-medium flex items-center transition">
              ← Back to tickets
            </button>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800`}>
                    {selectedTicket.status.toUpperCase()}
                  </span>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {selectedTicket.priority} Priority
                  </span>
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">{selectedTicket.subject}</h2>
                <div className="text-sm text-slate-500 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span>Requested by <strong>{selectedTicket.requester?.name || 'Unknown'}</strong></span>
                    <span>•</span>
                    <span>Assigned to <strong>{selectedTicket.assignee?.name || 'Unassigned'}</strong></span>
                  </div>
                  {(!selectedTicket.assignee_id && user?.role !== 'customer') && (
                    <button onClick={claimTicket} className="text-sm bg-brand-100 hover:bg-brand-200 text-brand-700 font-medium py-1 px-3 rounded-lg transition">
                      Claim Ticket
                    </button>
                  )}
                </div>
              </div>
              <div className="p-6 bg-slate-50 text-slate-700 whitespace-pre-wrap">
                {selectedTicket.description}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <h3 className="text-lg font-medium text-slate-900">Conversation</h3>
                {selectedTicket.comments?.map(comment => (
                  <div key={comment.id} className={`p-4 rounded-xl border ${comment.type === 'internal_note' ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-900">{comment.user?.name}</span>
                      <span className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-700 whitespace-pre-wrap text-sm">{comment.body}</p>
                  </div>
                ))}
              </div>

              <div className="col-span-1 space-y-4">
                <h3 className="text-lg font-medium text-slate-900">Activity Log</h3>
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 h-96 overflow-y-auto">
                  <ul className="space-y-4">
                    {selectedTicket.activities?.map(activity => (
                      <li key={activity.id} className="relative flex space-x-3">
                        <div>
                          <span className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center ring-4 ring-white">
                            <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-xs text-slate-500">
                              <span className="font-medium text-slate-900">{activity.user?.name || 'System'}</span> {activity.description}
                            </p>
                          </div>
                          <div className="text-right text-xs whitespace-nowrap text-slate-500">
                            {new Date(activity.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <form onSubmit={addComment} className="space-y-4">
                <textarea
                  value={replyBody}
                  onChange={e => setReplyBody(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition resize-none h-32 text-sm"
                  required
                />
                <div className="flex items-center justify-between">
                  {user?.role !== 'customer' ? (
                    <select value={replyType} onChange={e => setReplyType(e.target.value)} className="border border-slate-300 rounded-lg text-sm px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-brand-500">
                      <option value="public_reply">Public Reply</option>
                      <option value="internal_note">Internal Note</option>
                    </select>
                  ) : <div></div>}
                  <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 px-6 rounded-lg transition">
                    Send Reply
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
