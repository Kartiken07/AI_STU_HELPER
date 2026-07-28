import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface DashboardData {
  userName: string;
  grade?: string;
  location?: string;
  interests: string[];
  latestStream?: string;
  scores?: { aptitude?: number; science?: number; arts?: number; commerce?: number; };
  recentMessages: { text: string; isUser: boolean; timestamp: string }[];
  age?: number;
  gender?: string;
  classLevel?: string;
}

type PlanItem = { category: 'Sector' | 'Exam' | 'Job' | 'Higher'; text: string; degree: string };

const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({ userName: '', interests: [], recentMessages: [] });
  const [focus, setFocus] = useState<{ stream?: string; degree?: string }>({});
  const [storedRecs, setStoredRecs] = useState<Array<{ type: string; title: string; cta?: string }>>([]);
  const navigate = useNavigate();

  // Local sample data for roadmap/resources/notifications until backend integration
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeDegree, setActiveDegree] = useState<string>(() => localStorage.getItem('mapping_active_degree') || 'B.Sc');
  const [mappingSearch, setMappingSearch] = useState<string>('');
  const [plan, setPlan] = useState<PlanItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('career_plan') || '[]'); } catch { return []; }
  });
  const [graphExpanded, setGraphExpanded] = useState<Record<string, boolean>>({ root: true, cat_sectors: true, cat_exams: true, cat_jobs: true, cat_higher: true });
  const [graphZoom, setGraphZoom] = useState<number>(1);
  const [graphSelected, setGraphSelected] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      try {
        const userId = localStorage.getItem('currentUserId') || 'guest';
        const userInfoRaw = localStorage.getItem(`chat_userInfo_${userId}`);
        const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : { name: '', location: '', interests: [] };
        const profileRaw = localStorage.getItem(`user_profile_${userId}`);
        const profile = profileRaw ? JSON.parse(profileRaw) : {};
        const messagesRaw = localStorage.getItem(`chat_messages_${userId}`);
        const recentMessages = messagesRaw ? JSON.parse(messagesRaw).slice(-6) : [];
        const latestStream = localStorage.getItem('latest_predicted_stream') || undefined;
        const storedScoresRaw = localStorage.getItem('latest_quiz_scores');
        const storedScores = storedScoresRaw ? JSON.parse(storedScoresRaw) : undefined;
        const fStream = localStorage.getItem('dashboard_focus_stream') || undefined;
        const fDegree = localStorage.getItem('dashboard_focus_degree') || undefined;
        const recsRaw = localStorage.getItem('dashboard_recommendations');
        const recs = recsRaw ? JSON.parse(recsRaw) : [];
        setFocus({ stream: fStream, degree: fDegree });
        // If chatbot set a focus degree (e.g., B.Tech or MBBS), reflect it in the mapping tabs
        if (fDegree && fDegree !== localStorage.getItem('mapping_active_degree')) {
          setActiveDegree(fDegree);
        }
        setStoredRecs(Array.isArray(recs) ? recs : []);
        setData({
          userName: userInfo.name || profile.name || 'Student',
          location: userInfo.location || profile.location,
          interests: userInfo.interests || profile.interests || [],
          latestStream,
          recentMessages,
          scores: storedScores,
          age: profile.age,
          gender: profile.gender,
          classLevel: profile.classLevel || profile.class
        });
      } catch {}
    };
    load();
    // Poll in-tab for localStorage changes that do not trigger 'storage' event
    let lastSig = '';
    const calcSig = () => {
      try {
        const userId = localStorage.getItem('currentUserId') || 'guest';
        return [
          localStorage.getItem(`chat_userInfo_${userId}`) || '',
          localStorage.getItem(`user_profile_${userId}`) || '',
          localStorage.getItem('latest_predicted_stream') || '',
          localStorage.getItem('latest_quiz_scores') || '',
          localStorage.getItem('dashboard_focus_stream') || '',
          localStorage.getItem('dashboard_focus_degree') || '',
          localStorage.getItem('dashboard_recommendations') || ''
        ].join('|');
      } catch { return ''; }
    };
    lastSig = calcSig();
    const interval = window.setInterval(() => {
      const sig = calcSig();
      if (sig !== lastSig) {
        lastSig = sig;
        load();
      }
    }, 1500);
    const onStorage = () => load();
    const onFocus = () => load();
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    return () => {
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('mapping_active_degree', activeDegree);
  }, [activeDegree]);

  useEffect(() => {
    localStorage.setItem('career_plan', JSON.stringify(plan));
  }, [plan]);

  const page: React.CSSProperties = useMemo(() => ({
    minHeight: '100vh',
    background: 'radial-gradient(1200px 600px at 10% 0%, rgba(59,130,246,0.25), transparent 40%), radial-gradient(1200px 600px at 90% 10%, rgba(16,185,129,0.2), transparent 40%), linear-gradient(135deg, #0b0f1a 0%, #0f172a 50%, #0b1220 100%)',
    color: '#fff',
    padding: '84px 20px 56px',
    overflowX: 'hidden',
    width: '100vw',
    boxSizing: 'border-box'
  }), []);

  const container: React.CSSProperties = useMemo(() => ({
    margin: '0 auto',
    width: '100%',
    overflow: 'hidden'
  }), []);

  const card: React.CSSProperties = useMemo(() => ({
    background: 'linear-gradient(180deg, rgba(15,23,42,0.85), rgba(2,6,23,0.85))',
    border: '1px solid rgba(99,102,241,0.25)',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
    backdropFilter: 'blur(4px)',
    minWidth: 0
  }), []);

  const sectionTitle: React.CSSProperties = { marginTop: 0, marginBottom: 12 };

  const scoreBadge = (label: string, val?: number) => (
    <div style={{
      padding: '8px 12px',
      borderRadius: 12,
      border: '1px solid rgba(59,130,246,0.35)',
      background: 'linear-gradient(180deg, rgba(59,130,246,0.10), rgba(59,130,246,0.05))',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      marginRight: 8,
      marginBottom: 8,
      fontSize: 13
    }}>
      <span style={{ opacity: 0.9 }}>{label}</span>
      <span style={{ padding: '2px 8px', borderRadius: 8, background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.35)' }}>{val ?? '—'}</span>
    </div>
  );

  const buttonBase: React.CSSProperties = {
    marginTop: 12,
    padding: '10px 14px',
    borderRadius: 12,
    border: '1px solid rgba(99,102,241,0.35)',
    background: 'linear-gradient(135deg,#1f2937,#111827)',
    color: '#e5e7eb',
    cursor: 'pointer'
  };

  const smallLinkBtn: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: 10,
    border: '1px solid rgba(59,130,246,0.35)',
    background: 'rgba(59,130,246,0.10)',
    color: '#e5e7eb',
    cursor: 'pointer'
  };

  const chip = (label: string, active?: boolean, onClick?: () => void) => (
    <button onClick={onClick} style={{
      padding: '8px 12px',
      borderRadius: 12,
      border: `1px solid ${active ? 'rgba(16,185,129,0.65)' : 'rgba(99,102,241,0.35)'}`,
      background: active ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.10)',
      color: active ? '#bbf7d0' : '#e5e7eb',
      cursor: 'pointer'
    }}>{label}</button>
  );

  const chatBubble = (isUser: boolean): React.CSSProperties => ({
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    background: isUser ? 'linear-gradient(135deg,#10b9813a,#05966929)' : 'linear-gradient(135deg,#6366f11f,#4f46e50f)',
    border: `1px solid ${isUser ? 'rgba(16,185,129,0.35)' : 'rgba(99,102,241,0.35)'}`,
    color: '#e5e7eb',
    borderRadius: 14,
    padding: '10px 12px',
    maxWidth: '100%',
    width: 'fit-content'
  });

  const quizCompleted = Boolean(data.scores && (data.scores.aptitude || data.scores.science || data.scores.arts || data.scores.commerce));
  const quickRecommendationsCount = 3;
  const notifications = [
    { title: 'Admission deadline approaching', type: 'deadline' },
    { title: 'New scholarship added', type: 'scholarship' }
  ];

  const roadmap = [
    {
      id: 'degree',
      label: 'Degree Courses',
      children: [
        { id: 'bsc', label: 'B.Sc Computer Science', children: [
          { id: 'job1', label: 'Data Analyst', children: [
            { id: 'govt', label: 'Govt Job' },
            { id: 'corp', label: 'Corporate' }
          ]},
          { id: 'higher1', label: 'M.Sc Data Science' }
        ]},
        { id: 'bcom', label: 'B.Com', children: [{ id: 'finance', label: 'Finance Analyst' }]}
      ]
    },
    { id: 'skills', label: 'Skills', children: [
      { id: 'python', label: 'Python' },
      { id: 'sql', label: 'SQL' },
      { id: 'viz', label: 'Data Visualization' }
    ]},
    { id: 'certs', label: 'Certifications', children: [
      { id: 'numpy', label: 'NumPy Course' },
      { id: 'tableau', label: 'Tableau' }
    ]}
  ];

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const TreeNode: React.FC<{ node: any; depth?: number }> = ({ node, depth = 0 }) => (
    <div style={{ marginLeft: depth ? 12 : 0, marginTop: 6, minWidth: 0 }}>
      <div onClick={() => node.children && toggle(node.id)} style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        borderRadius: 10,
        border: '1px solid rgba(59,130,246,0.35)',
        background: 'rgba(59,130,246,0.07)',
        cursor: node.children ? 'pointer' : 'default'
      }}>
        {node.children && <span style={{ opacity: 0.8 }}>{expanded[node.id] ? '▾' : '▸'}</span>}
        <span>{node.label}</span>
      </div>
      {node.children && expanded[node.id] && (
        <div>
          {node.children.map((child: any) => (
            <TreeNode key={child.id} node={child} depth={(depth || 0) + 1} />
          ))}
        </div>
      )}
    </div>
  );

  const recCards = useMemo(() => {
    if (storedRecs && storedRecs.length) return storedRecs;
    const items: Array<{ type: string; title: string; cta?: string }> = [];
    const degree = focus.degree || activeDegree;
    const stream = (data.latestStream || focus.stream || '').toLowerCase();
    const interests = (data.interests || []).map(x => String(x).toLowerCase());
    const location = data.location || '';
    // Courses to apply for
    if (degree) items.push({ type: 'Course', title: `${degree} programs that match your interests`, cta: 'Explore Courses' });
    // Colleges nearby
    if (location) items.push({ type: 'College', title: `Top ${degree || 'Undergrad'} colleges near ${location}`, cta: 'View Colleges' });
    // Career paths
    const topInterest = interests[0] || (stream.includes('engineering') ? 'engineering' : stream.includes('commerce') ? 'finance' : stream.includes('arts') ? 'design' : undefined);
    if (topInterest) items.push({ type: 'Career Path', title: `Career paths aligned with ${topInterest}`, cta: 'See Roles' });
    // Study materials
    if (topInterest) items.push({ type: 'Study', title: `Best ${topInterest} study resources to get started`, cta: 'Open Resources' });
    if (!items.length) items.push({ type: 'Tip', title: 'Take the quiz or chat with AI to unlock tailored recommendations', cta: 'Get Started' });
    return items.slice(0, 4);
  }, [storedRecs, focus.degree, focus.stream, activeDegree, data.latestStream, data.interests, data.location]);

  // Enrich recommendations with first few AI college links if present
  const recCardsWithLinks = useMemo(() => {
    try {
      const userBuckets = JSON.parse(localStorage.getItem(`dashboard_link_buckets_${localStorage.getItem('currentUserId') || 'guest'}`) || '{}') || {};
      const colleges: any[] = userBuckets.colleges || [];
      if (!colleges.length) return recCards;
      const injected = [...recCards];
      // Replace first College type card with link
      const idx = injected.findIndex(r => (r.type || '').toLowerCase().includes('college'));
      if (idx >= 0) {
        injected[idx] = { ...injected[idx], title: colleges[0].title || colleges[0].url, cta: 'Open', url: colleges[0].url } as any;
      } else {
        injected.unshift({ type: 'College', title: colleges[0].title || colleges[0].url, cta: 'Open', url: colleges[0].url } as any);
      }
      return injected;
    } catch { return recCards; }
  }, [recCards]);

  const resources = [
    { type: 'E-book', title: 'Open Data Science Handbook', link: 'https://jakevdp.github.io/PythonDataScienceHandbook/' },
    { type: 'Course', title: 'CS50x on edX', link: 'https://www.edx.org/cs50' },
    { type: 'Video', title: 'Python for Data Analysis', link: 'https://youtube.com' },
    { type: 'E-book', title: 'Automate the Boring Stuff', link: 'https://automatetheboringstuff.com/' }
  ];

  const checklist = [
    { label: 'Profile completed', done: Boolean(localStorage.getItem('chat_userInfo_' + (localStorage.getItem('currentUserId') || 'guest'))) },
    { label: 'Career Quiz completed', done: quizCompleted },
    { label: 'First Recommendation viewed', done: false },
    { label: 'College Finder used', done: false }
  ];

  // Buckets persisted by chat for dashboard
  const userBucketsKey = `dashboard_link_buckets_${localStorage.getItem('currentUserId') || 'guest'}`;
  const userBuckets = (() => {
    try { return JSON.parse(localStorage.getItem(userBucketsKey) || '{}') || {}; } catch { return {}; }
  })();
  const userColleges = (() => {
    try { return JSON.parse(localStorage.getItem(`dashboard_user_colleges_${localStorage.getItem('currentUserId') || 'guest'}`) || '[]') || []; } catch { return []; }
  })();

  // Course-to-Career Mapping data
  const mappingData: Record<string, { sectors: string[]; exams: string[]; jobs: string[]; higher: string[] }> = {
    'B.Sc': {
      sectors: ['IT & Software', 'Analytics', 'Research Labs', 'EdTech'],
      exams: ['GATE (for M.Sc/PSUs)', 'CSIR NET', 'ISRO/DRDO Assistant'],
      jobs: ['Data Analyst', 'QA Engineer', 'Research Assistant', 'Technical Writer'],
      higher: ['M.Sc Data Science', 'MCA', 'MBA (Tech Mgmt)', 'Start a tutoring channel']
    },
    'B.Tech': {
      sectors: ['Software & IT', 'Electronics & Embedded', 'Automotive', 'Startups'],
      exams: ['GATE', 'ESE (UPSC)', 'CAT/XAT (for MBA)'],
      jobs: ['Software Engineer', 'Data Engineer', 'VLSI Design Engineer', 'DevOps Engineer'],
      higher: ['M.Tech', 'MBA', 'MS Abroad', 'Build a SaaS project']
    },
    'B.A.': {
      sectors: ['Media & Communication', 'Education', 'Civil Services'],
      exams: ['UPSC Civil Services', 'State PSC', 'NET/JRF (Humanities)'],
      jobs: ['Content Writer', 'Journalist', 'Community Manager', 'NGO Program Exec'],
      higher: ['M.A. in chosen subject', 'B.Ed', 'MSW', 'Start a blog/podcast']
    },
    'B.Com': {
      sectors: ['Finance', 'Banking', 'Accounting', 'Tax & Audit'],
      exams: ['IBPS PO/Clerk', 'SBI PO', 'SSC CGL (Accounts)'],
      jobs: ['Accountant', 'Financial Analyst', 'Tax Associate'],
      higher: ['CA/CS/CMA', 'MBA Finance', 'M.Com', 'Start bookkeeping services']
    },
    'BBA': {
      sectors: ['Sales & Marketing', 'Operations', 'HR', 'Startups'],
      exams: ['CAT/XAT/CMAT for MBA', 'SSC CGL'],
      jobs: ['Business Development', 'Operations Executive', 'HR Coordinator'],
      higher: ['MBA', 'PGDM', 'Start e-commerce venture']
    },
    'MBBS': {
      sectors: ['Hospitals', 'Healthcare Administration', 'Research & Pharma'],
      exams: ['NEET PG', 'USMLE/PLAB (Abroad)', 'AIIMS/PGIMER'],
      jobs: ['Junior Resident', 'Medical Officer', 'Clinical Research Associate'],
      higher: ['MD/MS', 'DNB', 'MPH/Healthcare Management', 'Start a clinic']
    }
  };

  const degreeTabs = Object.keys(mappingData);
  const activeMap = mappingData[activeDegree];

  const filterList = (arr: string[]) => arr.filter(x => x.toLowerCase().includes(mappingSearch.toLowerCase()));
  const filtered = {
    sectors: filterList(activeMap.sectors),
    exams: filterList(activeMap.exams),
    jobs: filterList(activeMap.jobs),
    higher: filterList(activeMap.higher)
  };

  const openSearch = (q: string) => window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
  const addToPlan = (category: PlanItem['category'], text: string) => {
    setPlan(prev => prev.some(p => p.category === category && p.text === text && p.degree === activeDegree) ? prev : [...prev, { category, text, degree: activeDegree }]);
  };
  const removeFromPlan = (idx: number) => setPlan(prev => prev.filter((_, i) => i !== idx));

  const renderList = (items: string[], category: PlanItem['category']) => (
    <ul style={{ margin: 8, paddingLeft: 18 }}>
      {items.map((s, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{s}</span>
          <span style={{ display: 'inline-flex', gap: 6 }}>
            <button style={smallLinkBtn} onClick={() => openSearch(`${s} ${category}`)}>Open</button>
            <button style={{ ...smallLinkBtn, border: '1px solid rgba(16,185,129,0.5)', background: 'rgba(16,185,129,0.12)' }} onClick={() => addToPlan(category, s)}>Save</button>
          </span>
        </li>
      ))}
    </ul>
  );

  const sendAssessmentToChat = () => {
    const scores = data.scores || {};
    const latestStream = data.latestStream || '';
    const summary = `Please evaluate my quiz thoroughly and explain strengths, gaps, and next steps.

Scores:
- Aptitude: ${scores.aptitude ?? 'NA'}
- Science: ${scores.science ?? 'NA'}
- Arts: ${scores.arts ?? 'NA'}
- Commerce: ${scores.commerce ?? 'NA'}
Predicted stream: ${latestStream || 'NA'}

Give me: 1) Recommended career paths, 2) Skills to build, 3) Entrance exams or internships to target, 4) Colleges list by my location if possible, 5) A 4-week action plan.`;
    const interestsFromQuiz = {
      interest_science: scores.science || 0,
      interest_arts: scores.arts || 0,
      interest_commerce: scores.commerce || 0
    };
    navigate('/chat', { state: { initialBotMessage: summary, interestsFromQuiz } });
  };

  // Build interactive graph nodes/edges based on expanded state
  type GNode = { id: string; label: string; depth: number; parent?: string; hasChildren: boolean };
  type GEdge = { from: string; to: string };

  const buildGraph = (): { nodes: GNode[]; edges: GEdge[] } => {
    const nodes: GNode[] = [];
    const edges: GEdge[] = [];
    // root
    nodes.push({ id: 'root', label: activeDegree, depth: 0, hasChildren: true });
    if (graphExpanded['root']) {
      const categories: Array<{ id: string; label: string; items: string[]; cat: PlanItem['category'] }> = [
        { id: 'cat_sectors', label: 'Sectors', items: filtered.sectors, cat: 'Sector' },
        { id: 'cat_exams', label: 'Govt Exams', items: filtered.exams, cat: 'Exam' },
        { id: 'cat_jobs', label: 'Private Jobs', items: filtered.jobs, cat: 'Job' },
        { id: 'cat_higher', label: 'Higher/E-ship', items: filtered.higher, cat: 'Higher' }
      ];
      categories.forEach(cat => {
        nodes.push({ id: cat.id, label: cat.label, depth: 1, parent: 'root', hasChildren: cat.items.length > 0 });
        edges.push({ from: 'root', to: cat.id });
        if (graphExpanded[cat.id]) {
          cat.items.forEach((it, idx) => {
            const id = `${cat.id}_item_${idx}`;
            nodes.push({ id, label: it, depth: 2, parent: cat.id, hasChildren: false });
            edges.push({ from: cat.id, to: id });
          });
        }
      });
    }
    return { nodes, edges };
  };

  const { nodes: graphNodes, edges: graphEdges } = buildGraph();

  const columnWidth = 240;
  const columnGap = 90;
  const nodeWidth = 200;
  const nodeHeight = 44;
  const rowGap = 20;

  const positions: Record<string, { x: number; y: number }> = {};
  const maxDepth = graphNodes.reduce((m, n) => Math.max(m, n.depth), 0);
  for (let d = 0; d <= maxDepth; d++) {
    const inCol = graphNodes.filter(n => n.depth === d);
    inCol.forEach((n, idx) => {
      positions[n.id] = { x: d * (columnWidth + columnGap), y: 20 + idx * (nodeHeight + rowGap) };
    });
  }
  const graphWidth = (maxDepth + 1) * (columnWidth + columnGap) + 40;
  const graphHeight = Math.max(220, (Object.values(positions).reduce((m, p) => Math.max(m, p.y), 0) + nodeHeight + 20));

  return (
    <div style={page}>
      <div style={container}>
        {/* Welcome Banner */}
        <div style={{ ...card, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', alignItems: 'center', padding: 24, border: '1px solid rgba(16,185,129,0.25)', gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 18, opacity: 0.95 }}>👋 Welcome,</div>
            <h2 style={{ margin: 6, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{data.userName || 'Student'}</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <div style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.08)' }}>📚 Career Quiz: {quizCompleted ? '✅ Completed' : '⏳ Pending'}</div>
              <div style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid rgba(59,130,246,0.35)', background: 'rgba(59,130,246,0.08)' }}>✨ Recommendations Available: {quickRecommendationsCount}</div>
              <div style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.35)', background: 'rgba(99,102,241,0.08)' }}>🔔 Latest Notifications: {notifications.length}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', opacity: 0.9, minWidth: 0 }}>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Location: {data.location || 'Not set'}</div>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Interests: {data.interests.length ? data.interests.join(', ') : 'Not set'}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: 16, marginTop: 16 }}>
          {/* Recommendations */}
          <div style={{ gridColumn: 'span 6', minWidth: 0 }}>
            <div style={card}>
              <h3 style={sectionTitle}>Personalized Recommendations</h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {(recCardsWithLinks || recCards).map((r, i) => (
                  <div key={i} style={{ minWidth: 220, flex: '1 1 240px', padding: 14, borderRadius: 14, border: '1px solid rgba(99,102,241,0.35)', background: 'rgba(99,102,241,0.06)' }}>
                    <div style={{ fontSize: 12, opacity: 0.8 }}> {r.type} </div>
                    <div style={{ marginTop: 6, wordBreak: 'break-word' }}>{r.title}</div>
                    { (r as any).url ? (
                      <a href={(r as any).url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <button style={{ ...buttonBase, marginTop: 10 }}>{r.cta || 'Open'}</button>
                      </a>
                    ) : (
                      <button style={{ ...buttonBase, marginTop: 10 }}>{r.cta}</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Assessment Summary */}
          <div style={{ gridColumn: 'span 6', minWidth: 0 }}>
            <div style={card}>
              <h3 style={sectionTitle}>Assessment Summary</h3>
              <p style={{ marginTop: 4 }}>Predicted Stream: <strong>{data.latestStream || '—'}</strong></p>
              <div style={{ marginTop: 8 }}>
                {scoreBadge('Aptitude', data.scores?.aptitude)}
                {scoreBadge('Science', data.scores?.science)}
                {scoreBadge('Arts', data.scores?.arts)}
                {scoreBadge('Commerce', data.scores?.commerce)}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button style={{ ...buttonBase, border: '1px solid rgba(16,185,129,0.35)', color: '#a7f3d0' }}
                  onClick={() => location.assign('/quiz')}>Retake / Improve</button>
                <button style={{ ...buttonBase, border: '1px solid rgba(99,102,241,0.5)', color: '#c7d2fe' }}
                  onClick={sendAssessmentToChat}>Ask AI to Analyze</button>
              </div>
            </div>
          </div>

          {/* Course-to-Career Mapping */}
          <div style={{ gridColumn: 'span 12', minWidth: 0 }}>
            <div style={card}>
              <h3 style={sectionTitle}>Course-to-Career Mapping</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {degreeTabs.map(d => (
                  <span key={d}>{chip(d, d === activeDegree, () => setActiveDegree(d))}</span>
                ))}
              </div>
              <div style={{ marginBottom: 12 }}>
                <input value={mappingSearch} onChange={e => setMappingSearch(e.target.value)} placeholder="Filter sectors, exams, jobs, higher-ed..." style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10,
                  border: '1px solid rgba(59,130,246,0.35)', background: 'rgba(2,6,23,0.6)', color: '#e5e7eb'
                }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
                <div style={{ border: '1px solid rgba(59,130,246,0.35)', borderRadius: 12, padding: 12 }}>
                  <div style={{ opacity: 0.8, fontSize: 12 }}>Sectors</div>
                  {renderList(filtered.sectors, 'Sector')}
                </div>
                <div style={{ border: '1px solid rgba(59,130,246,0.35)', borderRadius: 12, padding: 12 }}>
                  <div style={{ opacity: 0.8, fontSize: 12 }}>Govt Exams</div>
                  {renderList(filtered.exams, 'Exam')}
                </div>
                <div style={{ border: '1px solid rgba(59,130,246,0.35)', borderRadius: 12, padding: 12 }}>
                  <div style={{ opacity: 0.8, fontSize: 12 }}>Private Jobs</div>
                  {renderList(filtered.jobs, 'Job')}
                </div>
                <div style={{ border: '1px solid rgba(59,130,246,0.35)', borderRadius: 12, padding: 12 }}>
                  <div style={{ opacity: 0.8, fontSize: 12 }}>Higher Education / Entrepreneurship</div>
                  {renderList(filtered.higher, 'Higher')}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Course Graph */}
          <div style={{ gridColumn: 'span 12', minWidth: 0 }}>
            <div style={{ ...card, paddingBottom: 12 }}>
              <h3 style={sectionTitle}>Interactive Course Graph</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ opacity: 0.85, fontSize: 12 }}>Zoom</span>
                <input type="range" min={0.7} max={1.6} step={0.05} value={graphZoom} onChange={e => setGraphZoom(parseFloat(e.target.value))} />
                <span style={{ opacity: 0.85, fontSize: 12 }}>Click category nodes to expand/collapse; click items to open</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <svg width={graphWidth} height={graphHeight} style={{ transform: `scale(${graphZoom})`, transformOrigin: '0 0' }}>
                  {graphEdges.map((e, i) => {
                    const p1 = positions[e.from];
                    const p2 = positions[e.to];
                    if (!p1 || !p2) return null;
                    const x1 = p1.x + nodeWidth;
                    const y1 = p1.y + nodeHeight / 2;
                    const x2 = p2.x;
                    const y2 = p2.y + nodeHeight / 2;
                    const mx = (x1 + x2) / 2;
                    return (
                      <g key={i}>
                        <path d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`} stroke="rgba(99,102,241,0.6)" strokeWidth={2} fill="none" />
                      </g>
                    );
                  })}
                  {graphNodes.map(n => {
                    const p = positions[n.id];
                    const isSelected = graphSelected === n.id;
                    const isCategory = n.depth === 1;
                    const isRoot = n.depth === 0;
                    const fill = isRoot ? 'rgba(16,185,129,0.20)' : isCategory ? 'rgba(99,102,241,0.14)' : 'rgba(59,130,246,0.12)';
                    const stroke = isSelected ? 'rgba(16,185,129,0.7)' : isCategory ? 'rgba(99,102,241,0.55)' : 'rgba(59,130,246,0.45)';
                    const clickable = n.hasChildren || (!n.hasChildren && n.depth === 2);
                    const onClick = () => {
                      setGraphSelected(n.id);
                      if (n.hasChildren) setGraphExpanded(prev => ({ ...prev, [n.id]: !prev[n.id] }));
                      else if (n.depth === 2) openSearch(n.label);
                    };
                    return (
                      <g key={n.id} onClick={onClick} cursor={clickable ? 'pointer' : 'default'}>
                        <rect x={p.x} y={p.y} rx={12} ry={12} width={nodeWidth} height={nodeHeight} fill={fill} stroke={stroke} />
                        <text x={p.x + nodeWidth / 2} y={p.y + nodeHeight / 2 + 4} textAnchor="middle" fill="#e5e7eb" fontSize={12}>{n.label}</text>
                        {n.hasChildren && (
                          <text x={p.x + nodeWidth - 14} y={p.y + 18} textAnchor="middle" fill="#a7f3d0" fontSize={12}>{graphExpanded[n.id] ? '−' : '+'}</text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div style={{ marginTop: 10, borderTop: '1px solid rgba(99,102,241,0.25)', paddingTop: 10 }}>
                <div style={{ opacity: 0.85, fontSize: 12 }}>Selected:</div>
                <div style={{ marginTop: 6 }}>{graphSelected || 'None'}</div>
              </div>
            </div>
          </div>

          {/* My Plan */}
          <div style={{ gridColumn: 'span 12', minWidth: 0 }}>
            <div style={card}>
              <h3 style={sectionTitle}>My Plan</h3>
              {plan.length === 0 ? (
                <p style={{ opacity: 0.85 }}>Nothing saved yet. Use "Save" on any item above.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                  {plan.map((p, i) => (
                    <div key={`${p.text}-${i}`} style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.08)' }}>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>{p.category} • {p.degree}</div>
                      <div style={{ marginTop: 6 }}>{p.text}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button style={smallLinkBtn} onClick={() => openSearch(p.text)}>Open</button>
                        <button style={{ ...smallLinkBtn, border: '1px solid rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.12)' }} onClick={() => removeFromPlan(i)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Career Roadmap */}
          <div style={{ gridColumn: 'span 7', minWidth: 0 }}>
            <div style={card}>
              <h3 style={sectionTitle}>Career Roadmap</h3>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>Degree Courses → Job Options → Higher Studies → Skills → Certifications</div>
              <div>
                {roadmap.map(node => (
                  <TreeNode key={node.id} node={node} />
                ))}
              </div>
            </div>
          </div>

          {/* Resources */}
          <div style={{ gridColumn: 'span 5', minWidth: 0 }}>
            <div style={card}>
              <h3 style={sectionTitle}>Knowledge Resources</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {(userBuckets.books || userBuckets.materials)?.length ? (userBuckets.books.concat(userBuckets.materials)).map((res: any, i: number) => (
                  <a key={i} href={res.url} target="_blank" rel="noreferrer" style={{
                    textDecoration: 'none', color: 'inherit', padding: 14, borderRadius: 14,
                    border: '1px solid rgba(59,130,246,0.35)', background: 'rgba(59,130,246,0.06)'
                  }}>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{res.type || 'Resource'}</div>
                    <div style={{ marginTop: 6, wordBreak: 'break-word' }}>{res.title || res.url}</div>
                  </a>
                )) : resources.map((res, i) => (
                  <a key={i} href={res.link} target="_blank" rel="noreferrer" style={{
                    textDecoration: 'none', color: 'inherit', padding: 14, borderRadius: 14,
                    border: '1px solid rgba(59,130,246,0.35)', background: 'rgba(59,130,246,0.06)'
                  }}>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{res.type}</div>
                    <div style={{ marginTop: 6, wordBreak: 'break-word' }}>{res.title}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* User Colleges & AI College Links */}
          <div style={{ gridColumn: 'span 12', minWidth: 0 }}>
            <div style={card}>
              <h3 style={sectionTitle}>Colleges You’re Considering</h3>
              {(!userColleges || userColleges.length === 0) ? (
                <p style={{ opacity: 0.85 }}>Mention colleges in chat (e.g., "Colleges: IIT Delhi, DTU") and I’ll list them here.</p>
              ) : (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {userColleges.map((c: string, i: number) => (
                    <div key={i} style={{ padding: '8px 12px', borderRadius: 12, border: '1px solid rgba(59,130,246,0.35)', background: 'rgba(59,130,246,0.07)' }}>{c}</div>
                  ))}
                </div>
              )}
              {(userBuckets.colleges && userBuckets.colleges.length > 0) && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ opacity: 0.85, fontSize: 12, marginBottom: 8 }}>AI-Suggested College Links</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                    {userBuckets.colleges.map((c: any, i: number) => (
                      <a key={i} href={c.url} target="_blank" rel="noreferrer" style={{
                        textDecoration: 'none', color: 'inherit', padding: 12, borderRadius: 12,
                        border: '1px solid rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.08)'
                      }}>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>College</div>
                        <div style={{ marginTop: 6 }}>{c.title || c.url}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Exams */}
          <div style={{ gridColumn: 'span 4', minWidth: 0 }}>
            <div style={card}>
              <h3 style={sectionTitle}>Upcoming Exams</h3>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
                <li>JEE Main: Jan/Apr windows – register soon</li>
                <li>NEET UG: May – prep schedule</li>
                <li>CUET UG: Apr–May – subject selection</li>
              </ul>
            </div>
          </div>

          {/* Notifications */}
          <div style={{ gridColumn: 'span 8', minWidth: 0 }}>
            <div style={card}>
              <h3 style={sectionTitle}>Notifications & Alerts</h3>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
                {notifications.map((n, i) => (
                  <li key={i}>{n.title}</li>
                ))}
              </ul>
              <button style={{ ...buttonBase, marginTop: 12 }} onClick={() => alert('Open all notifications')}>View All Notifications →</button>
            </div>
          </div>

          {/* Recent Chat */}
          <div style={{ gridColumn: 'span 12', minWidth: 0 }}>
            <div style={card}>
              <h3 style={sectionTitle}>Recent Chat</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.recentMessages.length ? data.recentMessages.map((m, i) => (
                  <div key={i} style={chatBubble(m.isUser)}>
                    <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}><strong>{m.isUser ? 'You' : 'Assistant'}</strong></div>
                    <div>{m.text}</div>
                  </div>
                )) : <p style={{ opacity: 0.85 }}>No messages yet.</p>}
              </div>
              <button style={{ ...buttonBase, border: '1px solid rgba(99,102,241,0.35)', color: '#e9d5ff', marginTop: 14 }}
                onClick={() => location.assign('/chat')}>Continue Conversation</button>
            </div>
          </div>

          {/* Progress Tracker */}
          <div style={{ gridColumn: 'span 12', minWidth: 0 }}>
            <div style={card}>
              <h3 style={sectionTitle}>Progress Tracker</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {checklist.map((c, i) => (
                  <div key={i} style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.06)' }}>
                    {c.done ? '✅' : '🚧'} {c.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

