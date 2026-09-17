import { onRequest } from 'firebase-functions/v2/https'

// Esqueleto de Cloud Functions. En la fase 1 NO se despliega (exige el plan de pago Blaze).
// Aquí irá más adelante lo que no puede hacer la web por sí sola: enviar emails, moderar, etc.
export const helloWorld = onRequest({ region: 'europe-southwest1' }, (_request, response) => {
  response.send('Hola desde Finder')
})
