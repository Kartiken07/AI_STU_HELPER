import { useState, useEffect } from 'react';
import { API, apiGet, apiPost, apiPostFormData } from '../api/config';
import { useToast } from './Toast';
import { Skeleton } from './Skeleton';

interface CareerNode {
  id: string;
  name: string;
  type: string;
  parent_id: string | null;
  description: string;
  salary: string;
  exams: string[];
  duration: string;
  skills: string[];
  sort_order: number;
}

export function AdminDashboard() {
  const [nodes, setNodes] = useState<CareerNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<CareerNode>>({});
  const { showToast } = useToast();

  const fetchNodes = async () => {
    try {
      const tree: any[] = await apiGet(API.CAREER_TREE);
      const flat: CareerNode[] = [];
      const flatten = (items: any[]) => {
        for (const item of items) {
          flat.push({
            id: item.id,
            name: item.name,
            type: item.type,
            parent_id: item.parent_id || null,
            description: item.description || '',
            salary: item.salary || '',
            exams: item.exams || [],
            duration: item.duration || '',
            skills: item.skills || [],
            sort_order: item.sort_order || 0,
          });
          if (item.children) flatten(item.children);
        }
      };
      flatten(tree);
      setNodes(flat);
    } catch (e: any) {
      showToast('Failed to load career nodes: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNodes(); }, []);

  const startEdit = (node: CareerNode) => {
    setEditingId(node.id);
    setForm({ ...node });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({});
  };

  const saveNode = async () => {
    if (!form.id || !form.name) {
      showToast('ID and Name are required', 'error');
      return;
    }
    try {
      const existing = nodes.find(n => n.id === form.id);
      const url = existing
        ? `${API.ADMIN_CAREER_NODES}/${form.id}`
        : API.ADMIN_CAREER_NODES;
      const method = existing ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(form),
      });
      showToast(`Node ${existing ? 'updated' : 'created'} successfully`, 'success');
      cancelEdit();
      fetchNodes();
    } catch (e: any) {
      showToast('Failed to save node: ' + e.message, 'error');
    }
  };

  const deleteNode = async (id: string) => {
    if (!confirm('Delete this node and orphan its children?')) return;
    try {
      await fetch(`${API.ADMIN_CAREER_NODES}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      showToast('Node deleted', 'success');
      fetchNodes();
    } catch (e: any) {
      showToast('Failed to delete: ' + e.message, 'error');
    }
  };

  const containerStyle: React.CSSProperties = {
    padding: '24px',
    maxWidth: '1200px',
    margin: '80px auto 0',
    color: 'white',
    fontFamily: 'system-ui, sans-serif',
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(31, 41, 59, 0.8)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '16px',
    marginBottom: '12px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(15, 23, 42, 0.6)',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: '4px',
    textTransform: 'uppercase',
  };

  const btnStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '13px',
  };

  const typeColors: Record<string, string> = {
    root: '#8b5cf6',
    stream: '#3b82f6',
    degree: '#10b981',
    career: '#f59e0b',
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <h1 style={{ marginBottom: 24 }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3,4,5].map(i => <Skeleton key={i} height={60} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <button
          style={{ ...btnStyle, background: '#6366f1', color: 'white' }}
          onClick={() => startEdit({ id: '', name: '', type: 'degree', parent_id: nodes[0]?.id || null, description: '', salary: '', exams: [], duration: '', skills: [], sort_order: 0 })}
        >
          + Add Node
        </button>
      </div>

      {editingId !== null && (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ margin: '0 0 8px 0' }}>{nodes.find(n => n.id === editingId) ? 'Edit Node' : 'New Node'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>ID</label>
              <input style={inputStyle} value={form.id || ''} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} placeholder="e.g. 6.1" />
            </div>
            <div>
              <label style={labelStyle}>Name</label>
              <input style={inputStyle} value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Node name" />
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select style={inputStyle} value={form.type || 'degree'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="root">Root</option>
                <option value="stream">Stream</option>
                <option value="degree">Degree</option>
                <option value="career">Career</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Parent ID</label>
              <input style={inputStyle} value={form.parent_id || ''} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value || null }))} placeholder="Parent node ID" />
            </div>
            <div>
              <label style={labelStyle}>Salary</label>
              <input style={inputStyle} value={form.salary || ''} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} placeholder="e.g. 5-15 LPA" />
            </div>
            <div>
              <label style={labelStyle}>Duration</label>
              <input style={inputStyle} value={form.duration || ''} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 4 years" />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Exams (comma separated)</label>
              <input style={inputStyle} value={(form.exams || []).join(', ')} onChange={e => setForm(f => ({ ...f, exams: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} placeholder="JEE Main, NEET, ..." />
            </div>
            <div>
              <label style={labelStyle}>Skills (comma separated)</label>
              <input style={inputStyle} value={(form.skills || []).join(', ')} onChange={e => setForm(f => ({ ...f, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} placeholder="Math, Physics, ..." />
            </div>
            <div>
              <label style={labelStyle}>Sort Order</label>
              <input style={inputStyle} type="number" value={form.sort_order || 0} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={{ ...btnStyle, background: '#4b5563', color: 'white' }} onClick={cancelEdit}>Cancel</button>
            <button style={{ ...btnStyle, background: '#10b981', color: 'white' }} onClick={saveNode}>Save</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {nodes.map(node => (
          <div key={node.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  background: typeColors[node.type] || '#6b7280',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}>{node.type}</span>
                <strong>{node.name}</strong>
                <span style={{ color: '#6b7280', fontSize: 13 }}>ID: {node.id}</span>
                {node.parent_id && <span style={{ color: '#6b7280', fontSize: 13 }}>parent: {node.parent_id}</span>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={{ ...btnStyle, background: '#3b82f6', color: 'white' }} onClick={() => startEdit(node)}>Edit</button>
                <button style={{ ...btnStyle, background: '#ef4444', color: 'white' }} onClick={() => deleteNode(node.id)}>Delete</button>
              </div>
            </div>
            {node.salary && <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>💰 {node.salary} | ⏱ {node.duration}</div>}
            {node.exams?.length > 0 && <div style={{ color: '#94a3b8', fontSize: 13 }}>📝 {node.exams.join(', ')}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
