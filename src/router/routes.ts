import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '',
    redirect: { name: 'HotelList' },
    meta: {
      requiresAuth: true, // 這個路由需要登入權限
    },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '/hotels',
        redirect: { name: 'HotelList' },
        meta: {
          requiresPermission: true,
          permissionCode: 'hotel',
        },
        children: [
          {
            path: 'list',
            name: 'HotelList',
            meta: {
              root: { title: '酒店管理' },
              title: '酒店列表',
            },
            component: () => import('pages/HotelList/index.vue'),
          },
          {
            path: 'edit/:hotel_id',
            name: 'EditHotel',
            meta: {
              root: { title: '酒店管理' },
              parent: { title: '酒店列表', path: '/hotels/list' },
              title: '酒店編輯',
            },
            component: () => import('pages/HotelList/Edit.vue'),
          },
          {
            path: 'groups',
            name: 'HotelGroups',
            meta: {
              root: { title: '酒店管理' },
              title: '酒店集團列表',
            },
            component: () => import('pages/HotelGroup/index.vue'),
          },
          {
            path: 'brands',
            name: 'HotelBrandList',
            meta: {
              root: { title: '酒店管理' },
              title: '酒店品牌列表',
            },
            component: () => import('pages/HotelBrand/index.vue'),
          },
        ],
      },
      {
        path: '/members',
        redirect: { name: 'MemberList' },
        meta: {
          requiresPermission: true,
          permissionCode: 'member',
        },
        children: [
          {
            path: 'list',
            name: 'MemberList',
            meta: {
              root: { title: '會員管理' },
              title: '會員列表',
            },
            component: () => import('pages/Member/index.vue'),
          },
          {
            path: 'add',
            name: 'AddMember',
            meta: {
              root: { title: '會員管理' },
              title: '新增會員',
            },
            component: () => import('pages/Member/Add.vue'),
          },
          {
            path: ':id',
            name: 'EditMember',
            meta: {
              root: { title: '會員管理' },
              parent: { title: '會員列表', path: '/members/list' },
              title: '會員編輯',
            },
            component: () => import('pages/Member/Edit.vue'),
          },
          {
            path: 'apply',
            name: 'ApplyMembers',
            meta: {
              root: { title: '會員管理' },
              // parent: { title: '會員列表', path: '/members/list' },
              title: '待審核列表',
            },
            component: () => import('pages/Member/apply/index.vue'),
          },
          {
            path: 'apply/edit/:id',
            name: 'ApplyMemberEdit',
            meta: {
              root: { title: '會員管理' },
              parent: { title: '待審核列表', path: '/members/apply' },
              title: '待審核-編輯',
            },
            component: () => import('pages/Member/apply/Edit.vue'),
          },
          {
            path: 'incomplete-payment',
            name: 'IncompletePayment',
            meta: {
              root: { title: '會員管理' },
              parent: { title: '會員列表', path: '/members/list' },
              title: '未完成付款',
            },
            component: () => import('src/pages/Member/apply/IncompletePayment.vue'),
          },
        ],
      },
      {
        path: '/orders',
        redirect: { name: 'HotelOrderList' },
        meta: {
          requiresPermission: true,
          permissionCode: 'order',
        },
        children: [
          {
            path: 'hotel',
            name: 'HotelOrderList',
            meta: {
              root: { title: '訂單管理' },
              title: '酒店訂單列表',
            },
            component: () => import('src/pages/orders/hotel/index.vue'),
          },
          {
            path: 'hotel/:orderNumber',
            name: 'HotelOrderDetail',
            meta: {
              root: { title: '訂單管理' },
              parent: { title: '酒店訂單列表', path: '/orders/hotel' },
              title: '酒店訂單明細',
            },
            component: () => import('src/pages/orders/hotel/Detail.vue'),
          },
          {
            path: 'customized',
            name: 'CustomizedOrderList',
            meta: {
              root: { title: '訂單管理' },
              title: '客製訂單列表',
            },
            component: () => import('src/pages/orders/customized/index.vue'),
          },
          {
            path: 'customized/:orderNumber',
            name: 'CustomizedOrderDetail',
            meta: {
              root: { title: '訂單管理' },
              parent: { title: '客製訂單列表', path: '/orders/customized' },
              title: '客製訂單明細',
            },
            component: () => import('src/pages/orders/customized/Detail.vue'),
          },
          {
            path: 'member',
            name: 'MemberOrderList',
            meta: {
              root: { title: '訂單管理' },
              title: '會籍訂單列表',
            },
            component: () => import('src/pages/orders/member/index.vue'),
          },
          {
            path: 'member/:orderNumber',
            name: 'MemberOrderDetail',
            meta: {
              root: { title: '訂單管理' },
              parent: { title: '會籍訂單列表', path: '/orders/member' },
              title: '會籍訂單明細',
            },
            component: () => import('src/pages/orders/member/Detail.vue'),
          },
        ],
      },
      {
        path: '/accounting',
        redirect: { name: 'AccountingList' },
        meta: {
          requiresPermission: true,
          permissionCode: 'accounting',
        },
        children: [
          {
            path: 'order/hotel',
            name: 'AccountingHotelOrderList',
            meta: {
              root: { title: '訂單對帳管理' },
              title: '飯店訂單對帳',
            },
            component: () => import('src/pages/Accounting/index.vue'),
          },
        ],
      },
      {
        path: '/promotions',
        redirect: { name: 'PromotionMembershipList' },
        meta: {
          requiresPermission: true,
          permissionCode: 'promotion',
        },
        children: [
          {
            path: 'membership',
            name: 'PromotionMembershipList',
            meta: {
              root: { title: '行銷碼管理' },
              title: '會籍活動列表',
            },
            component: () => import('src/pages/Promotions/membership/index.vue'),
          },
          {
            path: 'membership/:promoMembershipId/codes',
            name: 'PromotionMembershipCodeList',
            meta: {
              root: { title: '行銷碼管理' },
              parent: { title: '會籍活動列表', path: '/promotions/membership' },
              title: '邀請碼清單',
            },
            component: () => import('src/pages/Promotions/membership/CodeList.vue'),
          },
        ],
      },
      {
        path: '/notifications',
        redirect: { name: 'MarketingNotifyList' },
        meta: {
          requiresPermission: true,
          permissionCode: 'notification',
        },
        children: [
          {
            path: 'marketing',
            name: 'MarketingNotifyList',
            meta: {
              root: { title: '推播管理' },
              title: '行銷通知列表',
            },
            component: () => import('src/pages/Notifications/marketing/index.vue'),
          },
        ],
      },
      {
        path: '/settings',
        redirect: { name: 'TagSetting' },
        meta: {
          requiresPermission: true,
          permissionCode: 'setting',
        },
        children: [
          {
            path: 'tag',
            name: 'TagSetting',
            meta: {
              root: { title: '參數設定' },
              title: '標籤設定',
            },
            component: () => import('pages/TagSet/index.vue'),
          },
          {
            path: 'country-region',
            name: 'CountryRegionSetting',
            meta: {
              root: { title: '參數設定' },
              title: '國家城市設定',
            },
            component: () => import('pages/CountryRegion/index.vue'),
          },
        ],
      },
      {
        path: '/currency/change',
        meta: {
          requiresAuth: true,
          title: '匯率查詢',
        },
        component: () => import('pages/Currency/index.vue'),
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    meta: {
      title: '登入頁',
    },
    component: () => import('layouts/EmptyLayout.vue'),
    children: [
      {
        name: 'LoginIndex',
        path: '',
        component: () => import('pages/Auth/index.vue'),
      },
    ],
  },
  {
    name: 'NoPermissionPage',
    path: '/no-permission',
    component: () => import('pages/NoPermission.vue'),
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
