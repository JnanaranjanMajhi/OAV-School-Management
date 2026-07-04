import { useState, useEffect, useRef, useMemo } from 'react';
import api, { SERVER_URL } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Send, MessageSquare, RefreshCw, Paperclip, X, File, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GrievanceChat() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({ 'Staff & Admin': true });
  
  const messagesEndRef = useRef(null);

  const fetchSidebarData = async () => {
    try {
      const [contactsRes, convsRes] = await Promise.all([
        api.get('/messages/contacts'),
        api.get('/messages/conversations')
      ]);
      setContacts(contactsRes.data.data);
      setConversations(convsRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load contacts');
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchMessages = async (partnerId, showLoading = true) => {
    if (showLoading) setLoadingMessages(true);
    try {
      const { data } = await api.get(`/messages/${partnerId}`);
      setMessages(data.data);
      // Update unread count in conversations if needed
      setConversations(prev => prev.map(c => 
        c.user._id === partnerId ? { ...c, unreadCount: 0 } : c
      ));
    } catch (err) {
      console.error(err);
      if (showLoading) toast.error('Failed to load messages');
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Poll for new messages when a chat is open
  useEffect(() => {
    let interval;
    if (activePartner) {
      interval = setInterval(() => {
        fetchMessages(activePartner._id, false);
      }, 5000); // Poll every 5 seconds
    }
    return () => clearInterval(interval);
  }, [activePartner]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchSidebarData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectPartner = (partner) => {
    setActivePartner(partner);
    fetchMessages(partner._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !activePartner) return;

    const content = newMessage;
    const file = selectedFile;
    setNewMessage('');
    setSelectedFile(null);

    // Optimistic update
    const tempMsg = {
      _id: Date.now().toString(),
      sender: user._id,
      receiver: activePartner._id,
      content,
      mediaUrl: file ? URL.createObjectURL(file) : '',
      mediaType: file ? file.type : '',
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const formData = new FormData();
      formData.append('receiverId', activePartner._id);
      if (content) formData.append('content', content);
      if (file) formData.append('media', file);

      await api.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchSidebarData(); // Update sidebar last message
    } catch (err) {
      console.error(err);
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m._id !== tempMsg._id)); // Revert
    }
  };

  // Merge contacts and conversations for the sidebar
  // Priority: Existing conversations first, then other contacts
  const sidebarUsers = useMemo(() => {
    const users = [];
    const convPartnerIds = new Set(conversations.map(c => c.user._id));
    
    conversations.forEach(c => users.push({
      ...c.user,
      lastMessage: c.lastMessage,
      unreadCount: c.unreadCount,
      isConv: true
    }));

    contacts.forEach(c => {
      if (!convPartnerIds.has(c._id)) {
        users.push({ ...c, isConv: false });
      }
    });
    return users;
  }, [conversations, contacts]);

  const groupedUsers = useMemo(() => {
    if (user.role === 'student') return { 'All Contacts': sidebarUsers };
    
    const groups = { 'Staff & Admin': [], 'Unassigned': [] };
    sidebarUsers.forEach(u => {
      if (u.role === 'teacher' || u.role === 'admin') {
        groups['Staff & Admin'].push(u);
      } else if (u.class) {
        if (!groups[u.class]) groups[u.class] = [];
        groups[u.class].push(u);
      } else {
        groups['Unassigned'].push(u);
      }
    });
    if (groups['Unassigned'].length === 0) delete groups['Unassigned'];
    if (groups['Staff & Admin'].length === 0) delete groups['Staff & Admin'];
    
    // Sort keys so classes are in order
    const sortedGroups = {};
    Object.keys(groups).sort().forEach(k => { sortedGroups[k] = groups[k]; });
    return sortedGroups;
  }, [sidebarUsers, user.role]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpandedGroups(prev => {
      const next = { ...prev };
      let changed = false;
      Object.entries(groupedUsers).forEach(([g, users]) => {
        if (users.some(u => u.unreadCount > 0) && !next[g]) {
          next[g] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [groupedUsers]);

  const toggleGroup = (group) => setExpandedGroups(p => ({ ...p, [group]: !p[group] }));

  return (
    <>
      <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.08))', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: '0 6px 15px rgba(139,92,246,0.15)' }}>
          <MessageSquare size={24} color="var(--primary)" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Grievances & Messages</h2>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
            {user.role === 'student' ? 'Directly message your teachers or the principal.' : 'Communicate with students and staff.'}
          </p>
        </div>
      </div>

      <div className="chat-layout card-elevated" style={{ border: '1px solid rgba(139,92,246,0.1)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg-card)' }}>
        
        {/* Sidebar */}
        <div className={`chat-sidebar ${activePartner ? 'hidden-mobile' : ''}`}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Contacts</h3>
            <button className="btn btn-sm" style={{ padding: '0.4rem' }} onClick={fetchSidebarData}>
              <RefreshCw size={14} />
            </button>
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loadingContacts ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}><div className="spinner-sm spinner" /></div>
            ) : Object.keys(groupedUsers).length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No contacts available.</div>
            ) : (
              Object.entries(groupedUsers).map(([groupName, usersInGroup]) => (
                <div key={groupName}>
                  <div 
                    onClick={() => toggleGroup(groupName)}
                    style={{ padding: '0.75rem 1rem', background: 'var(--bg)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}
                  >
                    {groupName} <span className="badge">{usersInGroup.length}</span>
                  </div>
                  {expandedGroups[groupName] && usersInGroup.map(u => (
                    <div 
                      key={u._id} 
                      onClick={() => handleSelectPartner(u)}
                      style={{ 
                        padding: '1rem', 
                        borderBottom: '1px solid var(--border)', 
                        borderLeft: activePartner?._id === u._id ? '3px solid var(--primary)' : '3px solid transparent',
                        cursor: 'pointer',
                        background: activePartner?._id === u._id ? 'linear-gradient(90deg, rgba(139,92,246,0.08), transparent)' : 'transparent',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 600, fontSize: '1.2rem' }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</span>
                          {u.unreadCount > 0 && (
                            <span style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 600 }}>
                              {u.unreadCount}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {u.role !== 'admin' && <span style={{ textTransform: 'capitalize' }}>{u.role}</span>}
                          {u.role !== 'admin' && u.class && ` • ${u.class}`}
                          {u.subject && (u.role === 'admin' ? u.subject : ` • ${u.subject}`)}
                        </div>
                        {u.isConv && u.lastMessage && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '0.2rem' }}>
                            {u.lastMessage.sender === user._id ? 'You: ' : ''}{u.lastMessage.content || (u.lastMessage.mediaUrl ? '📎 Attachment' : '')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-main">
          {!activePartner ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <MessageSquare size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <h3 style={{ textAlign: 'center' }}>Select a contact to start messaging</h3>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  className="btn btn-sm mobile-only" 
                  style={{ padding: '0.4rem', background: 'transparent', border: 'none', color: 'var(--text)' }}
                  onClick={() => setActivePartner(null)}
                >
                  <ArrowLeft size={20} />
                </button>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '1.2rem', flexShrink: 0 }}>
                  {activePartner.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{activePartner.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {activePartner.role !== 'admin' && <span style={{ textTransform: 'capitalize' }}>{activePartner.role}</span>}
                    {activePartner.role !== 'admin' && activePartner.class && ` • ${activePartner.class}`}
                    {activePartner.subject && (activePartner.role === 'admin' ? activePartner.subject : ` • ${activePartner.subject}`)}
                  </div>
                </div>
              </div>

              {/* Messages List */}
              <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loadingMessages ? (
                  <div style={{ margin: 'auto' }}><div className="spinner" /></div>
                ) : messages.length === 0 ? (
                  <div style={{ margin: 'auto', color: 'var(--text-muted)' }}>No messages yet. Say hi!</div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender?.toString() === user._id?.toString() || msg.sender === user._id;
                    return (
                      <div key={msg._id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <div style={{ 
                          maxWidth: '70%', 
                          padding: '0.75rem 1rem', 
                          borderRadius: '12px',
                          background: isMe ? 'linear-gradient(135deg, var(--primary), var(--primary-light))' : 'var(--bg-input)',
                          color: isMe ? '#fff' : 'var(--text)',
                          border: isMe ? 'none' : '1px solid var(--border-light)',
                          boxShadow: isMe ? '0 4px 15px rgba(139,92,246,0.2)' : 'none',
                          borderBottomRightRadius: isMe ? '2px' : '12px',
                          borderBottomLeftRadius: !isMe ? '2px' : '12px',
                        }}>
                          {msg.mediaUrl && (
                            <div style={{ marginBottom: msg.content ? '0.5rem' : 0 }}>
                              {msg.mediaType?.startsWith('image/') ? (
                                <img src={msg.mediaUrl.startsWith('http') ? msg.mediaUrl : `${SERVER_URL}${msg.mediaUrl}`} alt="Attachment" style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '300px', objectFit: 'cover' }} />
                              ) : (
                                <a href={msg.mediaUrl.startsWith('http') ? msg.mediaUrl : `${SERVER_URL}${msg.mediaUrl}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'inherit', textDecoration: 'underline', padding: '0.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                                  <File size={16} /> View Attachment
                                </a>
                              )}
                            </div>
                          )}
                          {msg.content && <div style={{ wordBreak: 'break-word', fontSize: '0.95rem' }}>{msg.content}</div>}
                          <div style={{ fontSize: '0.7rem', color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--text-dim)', textAlign: 'right', marginTop: '0.25rem' }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
                {selectedFile && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem', background: 'var(--bg)', borderRadius: '8px', width: 'fit-content' }}>
                    {selectedFile.type.startsWith('image/') ? <ImageIcon size={16} color="var(--primary)" /> : <File size={16} color="var(--primary)" />}
                    <span style={{ fontSize: '0.85rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile.name}</span>
                    <button type="button" onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex' }}><X size={14} /></button>
                  </div>
                )}
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <label style={{ cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '50%', transition: 'background 0.2s' }} className="hover-bg">
                    <input type="file" style={{ display: 'none' }} onChange={e => setSelectedFile(e.target.files[0])} accept="image/*,.pdf,.doc,.docx" />
                    <Paperclip size={20} />
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 1, marginBottom: 0, borderRadius: '24px', paddingLeft: '1.25rem' }}
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary" style={{ borderRadius: '24px', padding: '0 1.25rem', boxShadow: '0 4px 15px rgba(139,92,246,0.3)' }} disabled={!newMessage.trim() && !selectedFile}>
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
