interface Props {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = '8px', style }: Props) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }} />
  );
}

export function ChatSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ display: 'flex', gap: 12, justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start' }}>
          {i % 2 !== 0 && <Skeleton width={36} height={36} borderRadius="50%" />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '70%' }}>
            <Skeleton height={14} width={i * 60 + 60} />
            <Skeleton height={14} width={i * 40 + 80} />
            {i === 2 && <Skeleton height={14} width={100} />}
          </div>
          {i % 2 === 0 && <Skeleton width={36} height={36} borderRadius="50%" />}
        </div>
      ))}
    </div>
  );
}

export function QuizSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <Skeleton height={32} width="60%" />
      <Skeleton height={16} width="80%" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[1, 2, 3, 4].map(i => <Skeleton key={i} height={80} borderRadius="12px" />)}
      </div>
      <Skeleton height={48} width={200} borderRadius="16px" style={{ margin: '0 auto' }} />
    </div>
  );
}
