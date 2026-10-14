// Todas las rutas de la app en un solo sitio. Para enlazar a una pantalla se usa
// `paths.algo`, nunca el texto de la URL escrito a mano.
export const paths = {
  home: '/',
  items: '/objetos',
  itemDetail: (id: string) => `/objetos/${id}`,
  itemClaim: (id: string) => `/objetos/${id}/reclamar`,
  publish: '/publicar',
  login: '/login',
  register: '/registro',
  profile: '/perfil',
  myItems: '/mis-publicaciones',
  myClaims: '/mis-reclamaciones',
  styleguide: '/guia-de-estilos',
  example: '/ejemplo',
} as const
