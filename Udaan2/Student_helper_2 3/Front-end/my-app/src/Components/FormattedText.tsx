interface Props {
  text: string;
}

export function FormattedText({ text }: Props) {
  const parts: React.ReactNode[] = [];
  let i = 0;
  const lines = text.split('\n');

  for (const line of lines) {
    if (i > 0) parts.push(<br key={`br${i}`} />);

    let remaining = line;
    const segments: React.ReactNode[] = [];
    let segIdx = 0;

    while (remaining.length > 0) {
      const linkMatch = remaining.match(/^\[(.+?)\]\((https?:\/\/[^\s)]+)\)/);
      if (linkMatch) {
        segments.push(<a key={`${i}-${segIdx++}`} href={linkMatch[2]} target="_blank" rel="noreferrer">{linkMatch[1]}</a>);
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }
      const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
      if (boldMatch) {
        segments.push(<strong key={`${i}-${segIdx++}`}>{boldMatch[1]}</strong>);
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }
      const italicMatch = remaining.match(/^\*(.+?)\*/);
      if (italicMatch) {
        segments.push(<em key={`${i}-${segIdx++}`}>{italicMatch[1]}</em>);
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }
      const char = remaining[0];
      segments.push(char === ' ' ? ' ' : char);
      remaining = remaining.slice(1);
    }

    parts.push(<span key={`s${i}`}>{segments}</span>);
    i++;
  }

  return <>{parts}</>;
}
