import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { userSidebar } from '../sidebar.mjs';

const userGroups = new Set(userSidebar.map((group) => group.label));

export const isUserDocs = (pathname: string) => /\/user(\/|$)/.test(pathname);

type Entry = { type: 'link' | 'group'; label: string; isCurrent?: boolean; collapsed?: boolean; entries?: Entry[] };

const containsCurrent = (e: Entry): boolean =>
  e.type === 'link' ? !!e.isCurrent : (e.entries ?? []).some(containsCurrent);

// Shows only the sidebar of the docs set the page belongs to. Top-level groups are
// always open (they render as section labels); nested groups, i.e. the API
// resources, open only if they contain the current page.
export const onRequest = defineRouteMiddleware(({ locals, url }) => {
  const route = locals.starlightRoute;
  const user = isUserDocs(url.pathname);
  route.sidebar = route.sidebar.filter((e) => e.type !== 'group' || userGroups.has(e.label) === user);

  const collapse = (entries: Entry[]) => {
    for (const e of entries.filter((e) => e.type === 'group')) {
      e.collapsed = !containsCurrent(e);
      collapse(e.entries ?? []);
    }
  };
  for (const top of route.sidebar as Entry[]) {
    if (top.type !== 'group') continue;
    top.collapsed = false;
    collapse(top.entries ?? []);
  }
});
