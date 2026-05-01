export interface RouteLocationLike {
  href?: string
  pathname: string
  searchStr?: string
  hash?: string
}

export function getRedirectTarget(location: RouteLocationLike): string {
  if (typeof location.href === "string" && location.href.length > 0) {
    return location.href
  }

  return `${location.pathname}${location.searchStr ?? ""}${location.hash ?? ""}`
}
