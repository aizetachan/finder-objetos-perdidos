import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/components/layout/app-layout'
import { RequireAuth } from '@/components/require-auth'
import { LoginPage } from '@/features/account/login-page'
import { MyClaimsPage } from '@/features/account/my-claims-page'
import { MyItemsPage } from '@/features/account/my-items-page'
import { ProfilePage } from '@/features/account/profile-page'
import { RegisterPage } from '@/features/account/register-page'
import { ExamplePage } from '@/features/example/example-page'
import { ClaimItemPage } from '@/features/item-detail/claim-item-page'
import { ItemDetailPage } from '@/features/item-detail/item-detail-page'
import { PublishItemPage } from '@/features/publish-item/publish-item-page'
import { HomePage } from '@/features/search/home-page'
import { BorjaHomePage } from '@/features/search/borja-home-page'
import { SearchPage } from '@/features/search/search-page'
import { StyleguidePage } from '@/features/styleguide/styleguide-page'
import { ErrorPage } from './error-page'
import { NotFoundPage } from './not-found-page'
import { paths } from './paths'

// Mapa de pantallas. Para añadir una pantalla nueva:
//   1. añade su ruta en ./paths.ts
//   2. crea la página dentro de su carpeta en features/
//   3. añádela aquí (si necesita cuenta, envuélvela en <RequireAuth>)
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: paths.home, element: <HomePage /> },
      { path: paths.homeBorja, element: <BorjaHomePage /> },
      { path: paths.items, element: <SearchPage /> },
      { path: paths.itemDetail(':id'), element: <ItemDetailPage /> },
      { path: paths.itemClaim(':id'), element: <RequireAuth><ClaimItemPage /></RequireAuth> },
      { path: paths.publish, element: <RequireAuth><PublishItemPage /></RequireAuth> },
      { path: paths.login, element: <LoginPage /> },
      { path: paths.register, element: <RegisterPage /> },
      { path: paths.profile, element: <RequireAuth><ProfilePage /></RequireAuth> },
      { path: paths.myItems, element: <RequireAuth><MyItemsPage /></RequireAuth> },
      { path: paths.myClaims, element: <RequireAuth><MyClaimsPage /></RequireAuth> },
      { path: paths.styleguide, element: <StyleguidePage /> },
      { path: paths.example, element: <ExamplePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
