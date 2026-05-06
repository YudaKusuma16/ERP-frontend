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
        path: 'master/items',
        name: 'MasterItems',
        component: () => import('../views/master/MasterItemView.vue')
      },
      {
        path: 'master/items/:id',
        name: 'MasterItemDetail',
        component: () => import('../views/master/MasterItemDetailView.vue'),
        props: true
      },
      {
        path: 'master/vendors',
        name: 'MasterVendors',
        component: () => import('../views/master/MasterVendorView.vue')
      },
      {
        path: 'master/vendors/:id',
        name: 'MasterVendorDetail',
        component: () => import('../views/master/MasterVendorDetailView.vue'),
        props: true
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
        path: 'procurement/material-requests',
        name: 'MaterialRequests',
        component: () => import('../views/procurement/MaterialRequestView.vue')
      },
      {
        path: 'procurement/material-requests/:id',
        name: 'MaterialRequestDetail',
        component: () => import('../views/procurement/MaterialRequestDetailView.vue'),
        props: true
      },
      {
        path: 'procurement/service-requests',
        name: 'ServiceRequests',
        component: () => import('../views/procurement/ServiceRequestView.vue')
      },
      {
        path: 'procurement/service-requests/:id',
        name: 'ServiceRequestDetail',
        component: () => import('../views/procurement/ServiceRequestDetailView.vue'),
        props: true
      },
      {
        path: 'procurement/purchase-requisitions',
        name: 'PurchaseRequisitions',
        component: () => import('../views/procurement/PurchaseRequisitionView.vue')
      },
      {
        path: 'procurement/purchase-requisitions/:id',
        name: 'PurchaseRequisitionDetail',
        component: () => import('../views/procurement/PurchaseRequisitionDetailView.vue'),
        props: true
      },
      {
        path: 'procurement/purchase-orders',
        name: 'PurchaseOrders',
        component: () => import('../views/procurement/PurchaseOrderView.vue')
      },
      {
        path: 'procurement/purchase-orders/:id',
        name: 'PurchaseOrderDetail',
        component: () => import('../views/procurement/PurchaseOrderDetailView.vue'),
        props: true
      },
      {
        path: 'procurement/pre-receiving-documents',
        name: 'PreReceivingDocuments',
        component: () => import('../views/procurement/PreReceivingDocumentView.vue')
      },
      {
        path: 'procurement/pre-receiving-documents/:id',
        name: 'PreReceivingDocumentDetail',
        component: () => import('../views/procurement/PreReceivingDocumentDetailView.vue'),
        props: true
      },
      {
        path: 'procurement/receiving-documents',
        name: 'ReceivingDocuments',
        component: () => import('../views/procurement/ReceivingDocumentView.vue')
      },
      {
        path: 'procurement/receiving-documents/:id',
        name: 'ReceivingDocumentDetail',
        component: () => import('../views/procurement/ReceivingDocumentDetailView.vue'),
        props: true
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
        path: 'delivery/delivery-instructions',
        name: 'DeliveryInstructions',
        component: () => import('../views/delivery/DeliveryInstructionView.vue')
      },
      {
        path: 'delivery/delivery-instructions/:id',
        name: 'DeliveryInstructionDetail',
        component: () => import('../views/delivery/DeliveryInstructionDetailView.vue'),
        props: true
      },
      {
        path: 'delivery/delivery-notes',
        name: 'DeliveryNotes',
        component: () => import('../views/delivery/DeliveryNoteView.vue')
      },
      {
        path: 'delivery/delivery-notes/:id',
        name: 'DeliveryNoteDetail',
        component: () => import('../views/delivery/DeliveryNoteDetailView.vue'),
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

  return true
})

export default router