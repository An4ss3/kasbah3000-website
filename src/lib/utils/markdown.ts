/**
 * Minimal Markdown renderer for seed article bodies.
 *
 * Scope is intentionally limited to the subset of Markdown used in
 * `src/content/seed/articles.json` (## headings and blank-line-separated
 * paragraphs). Stage B swaps Supabase `body_i18n` rows through the same
 * accessor, so this stays a pure string-to-string transform with no new
 * dependency, per the frozen "no service layer" rule in the Cahier.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderArticleBody(markdown: string): string {
  const blocks = markdown.trim().split(/\n{2,}/);

  return blocks
    .map((block) => {
      const heading = block.match(/^(#{2,3})\s+(.*)$/);
      if (heading) {
        const level = heading[1].length;
        return `<h${level}>${escapeHtml(heading[2].trim())}</h${level}>`;
      }

      return `<p>${escapeHtml(block.trim())}</p>`;
    })
    .join('\n');
}
