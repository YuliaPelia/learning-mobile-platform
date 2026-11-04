/** Мінімальний markdown для конспектів: заголовки, абзаци, списки, блоки коду, **жирний**, `код`. */
export type Span = { text: string; bold?: boolean; code?: boolean };
export type Block =
  | { kind: 'heading'; spans: Span[] }
  | { kind: 'paragraph'; spans: Span[] }
  | { kind: 'list'; ordered: boolean; items: Span[][] }
  | { kind: 'code'; text: string };

export function parseInline(src: string): Span[] {
  const spans: Span[] = [];
  const re = /\*\*(.+?)\*\*|`([^`]+)`/g;
  let last = 0;
  for (let m = re.exec(src); m; m = re.exec(src)) {
    if (m.index > last) spans.push({ text: src.slice(last, m.index) });
    spans.push(m[1] !== undefined ? { text: m[1], bold: true } : { text: m[2], code: true });
    last = m.index + m[0].length;
  }
  if (last < src.length) spans.push({ text: src.slice(last) });
  return spans;
}

export function parseMarkdown(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ kind: 'paragraph', spans: parseInline(para.join(' ')) });
    para = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      flush();
      const code: string[] = [];
      for (i++; i < lines.length && !lines[i].trim().startsWith('```'); i++) code.push(lines[i]);
      blocks.push({ kind: 'code', text: code.join('\n') });
      continue;
    }
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      blocks.push({ kind: 'heading', spans: parseInline(heading[1].trim()) });
      continue;
    }
    const item = /^\s*(?:([-*+])|(\d+)[.)])\s+(.*)$/.exec(line);
    if (item) {
      flush();
      const ordered = item[2] !== undefined;
      const prev = blocks[blocks.length - 1];
      if (prev?.kind === 'list' && prev.ordered === ordered) prev.items.push(parseInline(item[3]));
      else blocks.push({ kind: 'list', ordered, items: [parseInline(item[3])] });
      continue;
    }
    if (!line.trim()) flush();
    else para.push(line.trim());
  }
  flush();
  return blocks;
}
