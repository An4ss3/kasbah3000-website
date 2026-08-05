/**
 * Typed pagination helper for `getStaticPaths` on `[...page]` routes.
 *
 * The emitted `page` param must match `Pagination.astro`'s `pageHref`
 * convention exactly: page 1 has no extra segment, page 2+ uses
 * `page/{n}`. Emitting a bare `{n}` would generate `/blog/2` while the
 * component links to `/blog/page/2`, producing 404s.
 */

export const ARTICLES_PER_PAGE = 6;

export interface PaginatedProps<T> {
  articles: T[];
  currentPage: number;
  totalPages: number;
}

interface PaginatedPath<T> {
  params: { page: string | undefined };
  props: PaginatedProps<T>;
}

/** Path segment appended to a base path for a given page number. */
export function pageSegment(page: number): string {
  return page === 1 ? '' : `/page/${page}`;
}

export function paginate<T>(items: T[], pageSize = ARTICLES_PER_PAGE): PaginatedPath<T>[] {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  return Array.from({ length: totalPages }, (_, index) => {
    const currentPage = index + 1;
    const start = index * pageSize;

    return {
      params: { page: currentPage === 1 ? undefined : `page/${currentPage}` },
      props: {
        articles: items.slice(start, start + pageSize),
        currentPage,
        totalPages,
      },
    };
  });
}
