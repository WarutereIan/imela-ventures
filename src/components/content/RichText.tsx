import { parseBlocks, renderInline } from './markdownLite';

export default function RichText({ source, className = 'prose-imela' }: { source: string; className?: string }) {
  const blocks = parseBlocks(source);
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        if (b.type === 'ul')
          return (
            <ul key={i}>
              {b.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        if (b.type === 'h2') return <h2 key={i}>{renderInline(b.text)}</h2>;
        if (b.type === 'h3') return <h3 key={i}>{renderInline(b.text)}</h3>;
        return <p key={i}>{renderInline(b.text)}</p>;
      })}
    </div>
  );
}
