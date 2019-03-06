import Vue from 'vue'
import Router from 'vue-router'

import AuthCallback from '@/auth/Callback'
import UnauthorizedPage from '@/pages/Unauthorized'
import MapPage from '@/pages/Map'
import PlaceList from '@/components/PlaceList.vue'
import PlaceDetails from '@/components/PlaceDetails.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: "/access_token=*",
      name: "AuthCallback",
      component: AuthCallback
    },
    {
      path: "/error=*",
      name: "ErrorCallback",
      component: AuthCallback
    },
    {
      path: "/unauthorized",
      name: "Unauthorized",
      component: UnauthorizedPage
    },
    {
      path: '/',
      component: MapPage,
      children: [
        {
          path: '',
          name: 'PlaceList',
          component: PlaceList
        },
        {
          path: 'new',
          name: 'NewPlace',
          component: PlaceDetails
        },
        {
          path: 'edit/:id',
          name: 'EditPlace',
          component: PlaceDetails,
          props: true
        },
      ]
    },
    {
      path: "*",
      name: "NotFound",
      component: MapPage
    }
  ]
})
