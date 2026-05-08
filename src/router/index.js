import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('../components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/dashboard/DashboardView.vue')
      },
      {
        path: 'master',
        component: () => import('../views/master/MasterDataView.vue'),
        children: [
          {
            path: '',
            redirect: { name: 'MasterItems' }
          },
          {
            path: 'items',
            name: 'MasterItems',
            component: () => import('../views/master/MasterItemView.vue')
          },
          {
            path: 'items/:id',
            name: 'MasterItemDetail',
            component: () => import('../views/master/MasterItemDetailView.vue'),
            props: true
          },
          {
            path: 'vendors',
            name: 'MasterVendors',
            component: () => import('../views/master/MasterVendorView.vue'),
            meta: { allowedRoles: ['purchasing', 'accounting'] }
          },
          {
            path: 'vendors/:id',
            name: 'MasterVendorDetail',
            component: () => import('../views/master/MasterVendorDetailView.vue'),
            props: true,
            meta: { allowedRoles: ['purchasing', 'accounting'] }
          },
        ]
      },
      {
        path: 'departments',
        name: 'Departments',
        component: () => import('../views/master/DepartmentView.vue')
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('../views/master/RoleView.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/master/UserView.vue')
      },
      {
        path: 'approval-tiers',
        name: 'ApprovalTiers',
        component: () => import('../views/master/ApprovalTierView.vue')
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('../views/dashboard/NotificationsView.vue')
      },
      {
        path: 'procurement',
        component: () => import('../views/procurement/ProcurementView.vue'),
        children: [
          {
            path: '',
            redirect: { name: 'MaterialRequests' }
          },
          {
            path: 'material-requests',
            name: 'MaterialRequests',
            component: () => import('../views/procurement/MaterialRequestView.vue')
          },
          {
            path: 'material-requests/:id',
            name: 'MaterialRequestDetail',
            component: () => import('../views/procurement/MaterialRequestDetailView.vue'),
            props: true
          },
          {
            path: 'service-requests',
            name: 'ServiceRequests',
            component: () => import('../views/procurement/ServiceRequestView.vue')
          },
          {
            path: 'service-requests/:id',
            name: 'ServiceRequestDetail',
            component: () => import('../views/procurement/ServiceRequestDetailView.vue'),
            props: true
          },
        ]
      },
      {
        path: 'purchase',
        component: () => import('../views/purchase/PurchaseView.vue'),
        children: [
          {
            path: '',
            redirect: { name: 'PurchaseRequisitions' }
          },
          {
            path: 'requisitions',
            name: 'PurchaseRequisitions',
            component: () => import('../views/procurement/PurchaseRequisitionView.vue')
          },
          {
            path: 'requisitions/:id',
            name: 'PurchaseRequisitionDetail',
            component: () => import('../views/procurement/PurchaseRequisitionDetailView.vue'),
            props: true
          },
          {
            path: 'orders',
            name: 'PurchaseOrders',
            component: () => import('../views/procurement/PurchaseOrderView.vue')
          },
          {
            path: 'orders/:id',
            name: 'PurchaseOrderDetail',
            component: () => import('../views/procurement/PurchaseOrderDetailView.vue'),
            props: true
          },
        ]
      },
      {
        path: 'docs',
        component: () => import('../views/docs/DocsView.vue'),
        children: [
          {
            path: '',
            redirect: { name: 'PreReceivingDocuments' }
          },
          {
            path: 'pre-receiving',
            name: 'PreReceivingDocuments',
            component: () => import('../views/procurement/PreReceivingDocumentView.vue')
          },
          {
            path: 'pre-receiving/:id',
            name: 'PreReceivingDocumentDetail',
            component: () => import('../views/procurement/PreReceivingDocumentDetailView.vue'),
            props: true
          },
          {
            path: 'receiving',
            name: 'ReceivingDocuments',
            component: () => import('../views/procurement/ReceivingDocumentView.vue')
          },
          {
            path: 'receiving/:id',
            name: 'ReceivingDocumentDetail',
            component: () => import('../views/procurement/ReceivingDocumentDetailView.vue'),
            props: true
          },
        ]
      },
      {
        path: 'delivery',
        component: () => import('../views/delivery/DeliveryView.vue'),
        children: [
          {
            path: '',
            redirect: { name: 'DeliveryInstructions' }
          },
          {
            path: 'order-request-forms',
            name: 'OrderRequestForms',
            component: () => import('../views/delivery/OrderRequestFormView.vue')
          },
          {
            path: 'order-request-forms/:id',
            name: 'OrderRequestFormDetail',
            component: () => import('../views/delivery/OrderRequestFormDetailView.vue'),
            props: true
          },
          {
            path: 'instructions',
            name: 'DeliveryInstructions',
            component: () => import('../views/delivery/DeliveryInstructionView.vue')
          },
          {
            path: 'instructions/:id',
            name: 'DeliveryInstructionDetail',
            component: () => import('../views/delivery/DeliveryInstructionDetailView.vue'),
            props: true
          },
          {
            path: 'notes',
            name: 'DeliveryNotes',
            component: () => import('../views/delivery/DeliveryNoteView.vue')
          },
          {
            path: 'notes/:id',
            name: 'DeliveryNoteDetail',
            component: () => import('../views/delivery/DeliveryNoteDetailView.vue'),
            props: true
          },
        ]
      },
      {
        path: 'delivery/work-orders',
        name: 'WorkOrders',
        component: () => import('../views/delivery/WorkOrderView.vue')
      },
      {
        path: 'delivery/work-orders/:id',
        name: 'WorkOrderDetail',
        component: () => import('../views/delivery/WorkOrderDetailView.vue'),
        props: true
      },
      {
        path: 'delivery/acceptance-letters',
        name: 'AcceptanceLetters',
        component: () => import('../views/delivery/AcceptanceLetterView.vue')
      },
      {
        path: 'delivery/acceptance-letters/:id',
        name: 'AcceptanceLetterDetail',
        component: () => import('../views/delivery/AcceptanceLetterDetailView.vue'),
        props: true
      },
      {
        path: 'delivery/rrvs',
        name: 'Rrvs',
        component: () => import('../views/delivery/RrvView.vue')
      },
      {
        path: 'delivery/rrvs/:id',
        name: 'RrvDetail',
        component: () => import('../views/delivery/RrvDetailView.vue'),
        props: true
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('../views/reports/ReportsView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        await authStore.fetchUser()
        return true
      } catch {
        authStore.logout()
        return { name: 'Login' }
      }
    }
    return { name: 'Login' }
  }

  if (to.name === 'Login' && authStore.isAuthenticated) {
    return { name: 'Dashboard' }
  }

  if (to.meta?.allowedRoles?.length) {
    const allowed = to.meta.allowedRoles
    const hasAccess = allowed.some(role => authStore.hasRole(role))
    if (!hasAccess) {
      return { name: 'Dashboard' }
    }
  }

  return true
})

export default router