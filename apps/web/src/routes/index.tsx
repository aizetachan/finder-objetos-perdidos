import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/components/layout/app-layout'
import { RequireAuth } from '@/components/require-auth'
import { RequireVerified } from '@/components/require-verified'
import { CompleteAccountPage } from '@/features/account/complete-account-page'
import { LoginPage } from '@/features/account/login-page'
import { MyClaimsPage } from '@/features/account/my-claims-page'
import { MyItemsPage } from '@/features/account/my-items-page'
import { ProfilePage } from '@/features/account/profile-page'
import { RegisterPage } from '@/features/account/register-page'
import { VerifyEmailPage } from '@/features/account/verify-email-page'
import { VerifyEmailPendingPage } from '@/features/account/verify-email-pending-page'
import { VerifyIdentityPage } from '@/features/account/verify-identity-page'
import { ExamplePage } from '@/features/example/example-page'
import { ClaimItemPage } from '@/features/item-detail/claim-item-page'
import { ItemDetailPage } from '@/features/item-detail/item-detail-page'
import { ConfirmGuestEmailPage } from '@/features/publish-item/confirm-guest-email-page'
import { PublishItemPage } from '@/features/publish-item/publish-item-page'
import { HomePage } from '@/features/search/home-page'
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
      { path: paths.items, element: <SearchPage /> },
      { path: paths.itemDetail(':id'), element: <ItemDetailPage /> },
      {
        path: paths.itemClaim(':id'),
        element: (
          <RequireAuth>
            <RequireVerified need="claim">
              <ClaimItemPage />
            </RequireVerified>
          </RequireAuth>
        ),
      },
      { path: paths.publish, element: <PublishItemPage /> },
      { path: paths.confirmGuestEmail, element: <ConfirmGuestEmailPage /> },
      { path: paths.completeAccount, element: <CompleteAccountPage /> },
      { path: paths.login, element: <LoginPage /> },
      { path: paths.register, element: <RegisterPage /> },
      { path: paths.verifyEmailPending, element: <VerifyEmailPendingPage /> },
      { path: paths.verifyEmail, element: <VerifyEmailPage /> },
      { path: paths.verifyIdentity, element: <RequireAuth><VerifyIdentityPage /></RequireAuth> },
      { path: paths.profile, element: <RequireAuth><ProfilePage /></RequireAuth> },
      { path: paths.myItems, element: <RequireAuth><MyItemsPage /></RequireAuth> },
      { path: paths.myClaims, element: <RequireAuth><MyClaimsPage /></RequireAuth> },
      { path: paths.styleguide, element: <StyleguidePage /> },
      { path: paths.example, element: <ExamplePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
