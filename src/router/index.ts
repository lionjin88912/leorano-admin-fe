import { route } from 'quasar/wrappers'
import { LocalStorage } from 'quasar'

import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
  Router,
} from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */
export let router: Router

function setRouterInstance(routerInstance: Router) {
  router = routerInstance
}

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE),
  })
  setRouterInstance(Router)

  Router.beforeEach((to, from, next) => {
    // 這個路由需要檢查權限
    if (to.matched.some((record) => record.meta.requiresPermission)) {
      if (!hasPermissionData()) {
        next('/login')
        return
      }
      const record = to.matched.find((record) => record.meta.requiresPermission)
      if (!hasPermission(<string>record?.meta.permissionCode)) {
        next('/no-permission')
        return
      }
    }
    // 這個路由需要登入權限
    if (to.matched.some((record) => record.meta.requiresAuth)) {
      // 判斷是否已經登入
      if (!isLoggedIn()) {
        next('/login') // 如果未登入，則導向登入頁面
        return
      }
    }
    next()
  })

  function hasPermissionData(): boolean {
    return !!LocalStorage.getItem('permissions')
  }
  function hasPermission(permissionCode: string): boolean {
    const permissions: any = LocalStorage.getItem('permissions') || {}
    return permissions.hasOwnProperty(permissionCode) && permissions[permissionCode]
  }

  function isLoggedIn(): boolean {
    const hasToken = LocalStorage.has('token')
    if (!hasToken) {
      return false
    }

    try {
      const token: any = JSON.parse(LocalStorage.getItem('token') || '{}')
      const expiredTime: number = (token.expires_at || 0) * 1000
      const currentTime = new Date().getTime()
      if (currentTime >= expiredTime) {
        return false
      }
    } catch {
      return false
    }
    return true
  }
  return Router
})
