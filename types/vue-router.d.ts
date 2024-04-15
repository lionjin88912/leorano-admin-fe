import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta extends Record<string | number | symbol, unknown> {
    requiresAuth?: boolean
    requiresPermission?: boolean
    permissionCode?: string
    root?: {
      title?: string
      path?: string
    }
    parent?: {
      title?: string
      path?: string
    }
    title?: string
  }
}
