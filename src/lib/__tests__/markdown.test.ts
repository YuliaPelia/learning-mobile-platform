import { parseInline, parseMarkdown } from '../markdown';

describe('parseInline', () => {
  it('виділяє жирний і код', () => {
    expect(parseInline('Цикл **for** і `while`!')).toEqual([
      { text: 'Цикл ' },
      { text: 'for', bold: true },
      { text: ' і ' },
      { text: 'while', code: true },
      { text: '!' },
    ]);
  });
});

describe('parseMarkdown', () => {
  it('розбирає заголовок, абзац, список і код', () => {
    const md = '# Цикли\nПерший рядок\nдругий рядок\n\n- a\n- b\n\n1. x\n\n```py\nfor i in range(3):\n  print(i)\n```';
    const blocks = parseMarkdown(md);
    expect(blocks.map((b) => b.kind)).toEqual(['heading', 'paragraph', 'list', 'list', 'code']);
    expect(blocks[1]).toEqual({ kind: 'paragraph', spans: [{ text: 'Перший рядок другий рядок' }] });
    expect(blocks[2]).toMatchObject({ ordered: false, items: [[{ text: 'a' }], [{ text: 'b' }]] });
    expect(blocks[3]).toMatchObject({ ordered: true });
    expect(blocks[4]).toEqual({ kind: 'code', text: 'for i in range(3):\n  print(i)' });
  });

  it('незакритий блок коду не губить текст', () => {
    expect(parseMarkdown('```\nx = 1')).toEqual([{ kind: 'code', text: 'x = 1' }]);
  });

  it('порожній вхід — порожній результат', () => {
    expect(parseMarkdown('')).toEqual([]);
  });
});
