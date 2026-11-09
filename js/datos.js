/* ==========================================================
   Datos de la boda: lugares y alojamientos.
   El mapa y las fichas de "Dónde dormir" leen de aquí:
   si cambias algo, cambia en los dos sitios.
   Coordenadas: [longitud, latitud].
   ========================================================== */

const LUGARES = {
  ceremonia: { nombre: 'Ceremonia · Ciudadela', detalle: '18:30', c: [-1.64932, 42.81213] },
  banquete:  { nombre: 'Banquete · Asador Erreleku', detalle: '20:00 · cóctel, cena y fiesta', c: [-1.64569, 42.78839] },
};

// Bloques de alojamiento. Precio: nivel orientativo (€ a €€€€€).
// d = distancia a la Ciudadela; t = villavesa (opcional); u = web; q = búsqueda en Google Maps.
const ALOJAMIENTOS = [
  { id: 'centro', titulo: 'En el centro, cerca de la ceremonia', color: 'terra', hoteles: [
    { id: 'perla', mapa: 'La Perla', n: 'Gran Hotel La Perla', p: '€€€€€', m: '5★ · Plaza del Castillo, 1', d: 'A 1,1 km de la Ciudadela · 14 min a pie', u: 'https://www.granhotellaperla.com/', q: 'Gran Hotel La Perla, Plaza del Castillo 1, Pamplona', c: [-1.64261, 42.81769] },
    { id: 'tresreyes', mapa: 'Tres Reyes', n: 'Hotel Tres Reyes', p: '€€€', m: '4★ · Jardines de la Taconera', d: 'A 0,5 km de la Ciudadela · 7 min a pie', u: 'https://www.hotel3reyes.com', q: 'Hotel Tres Reyes, Pamplona', c: [-1.64915, 42.81581] },
    { id: 'maisonnave', mapa: 'Maisonnave', n: 'Hotel Maisonnave', p: '€€€', m: '4★ · Calle Nueva, 20', d: 'A 0,8 km de la Ciudadela · 11 min a pie', u: 'http://www.hotelmaisonnave.es/', q: 'Hotel Maisonnave, Calle Nueva 20, Pamplona', c: [-1.64508, 42.81734] },
    { id: 'catedral', mapa: 'Pamplona Catedral', n: 'Pamplona Catedral Hotel', p: '€€€', m: '4★ · Calle Dos de Mayo, 4', d: 'A 1,2 km de la Ciudadela · 17 min a pie', u: 'https://www.pamplonacatedralhotel.com', q: 'Pamplona Catedral Hotel, Calle Dos de Mayo 4, Pamplona', c: [-1.64373, 42.82029] },
    { id: 'arriazu', mapa: 'Hostal Arriazu', n: 'Hostal Arriazu', p: '€€', m: '2★ · Hostal · Calle Comedias, 14', d: 'A 0,8 km de la Ciudadela · 11 min a pie', u: 'http://www.hostalarriazu.com/', q: 'Hostal Arriazu, Calle Comedias 14, Pamplona', c: [-1.64376, 42.81632] },
    { id: 'blanca', mapa: 'Blanca de Navarra', n: 'Hotel Blanca de Navarra', p: '€€', m: '4★ · Avenida Pío XII, 43 · San Juan', d: 'A 1,3 km de la Ciudadela · 18 min a pie', t: '9 min en villavesa (L15, L18)', u: 'https://www.hotelblancadenavarra.com', q: 'Hotel Blanca de Navarra, Avenida Pío XII 43, Pamplona', c: [-1.66088, 42.80664] },
    { id: 'nh', mapa: 'NH Iruña Park', n: 'NH Pamplona Iruña Park', p: '€€', m: '4★ · Calle Arcadio María Larraona, 1 · San Juan', d: 'A 1,5 km de la Ciudadela · 20 min a pie', t: '14 min en villavesa (L12)', u: 'https://www.nh-hotels.com/es/hotel/nh-pamplona-iruna-park', q: 'NH Pamplona Iruña Park, Calle Arcadio María Larraona 1, Pamplona', c: [-1.66385, 42.81158] },
    { id: 'albret', mapa: 'Albret', n: 'Hotel Albret', p: '€€', m: '4★ · Calle Ermitagaña, 3 · San Juan', d: 'A 2,0 km de la Ciudadela · 27 min a pie', t: '16 min en villavesa (L12)', u: 'https://www.hotelalbret.com', q: 'Hotel Albret, Calle Ermitagaña 3, Pamplona', c: [-1.66917, 42.80970] },
    { id: 'plaza', mapa: 'Pamplona Plaza', n: 'Hotel Pamplona Plaza', p: '€', m: '3★ · Av. Marcelo Celayeta, 35 · Rochapea', d: 'A 2,0 km de la Ciudadela · 26 min a pie', t: '16 min en villavesa (L21)', u: 'https://www.hotelpamplonaplaza.com/', q: 'Hotel Pamplona Plaza, Avenida Marcelo Celayeta 35, Pamplona', c: [-1.65522, 42.82598] },
  ]},
  { id: 'cordovilla', titulo: 'A un paso del banquete, en Cordovilla', color: 'oliva', hoteles: [
    { id: 'bed4u', mapa: 'Bed4u', n: 'Hotel Bed4u Pamplona', p: '€', m: '3★ · Ctra. de Zaragoza, km 3 · Cordovilla', d: 'A 3,9 km de la Ciudadela · 7 min en coche', t: '22 min en villavesa (L16)', u: 'https://www.bed4uhotels.com', q: 'Hotel Bed4u Pamplona, Cordovilla', c: [-1.63992, 42.79000] },
    { id: 'zenit', mapa: 'Zenit', n: 'Hotel Zenit Pamplona', p: '€€', m: '4★ · Parque Comercial Galaria', d: 'A 4,6 km de la Ciudadela · 8 min en coche', t: '27 min en villavesa (L11)', u: 'https://pamplona.zenithoteles.com', q: 'Hotel Zenit Pamplona, Galaria', c: [-1.63202, 42.78724] },
    { id: 'holiday', mapa: 'Holiday Inn Express', n: 'Holiday Inn Express Pamplona', p: '€€', m: '3★ · Galaria, Mutilva Baja · desayuno incluido', d: 'A 5,2 km de la Ciudadela · 10 min en coche', t: '34 min en villavesa (L11)', u: 'https://www.ihg.com/holidayinnexpress/hotels/es/es/pamplona/pnasp/hoteldetail', q: 'Holiday Inn Express Pamplona, Galaria', c: [-1.62796, 42.78327] },
  ]},
  { id: 'coche', titulo: 'Mejor en coche', color: 'pizarra', hoteles: [
    { id: 'iraipe', mapa: 'Hostal Iraipe', n: 'Iraipe Pamplona Hostal', p: '€', m: '3★ · Hostal · Calle Berrioplano, 2 · Ansoáin', d: 'A 2,8 km de la Ciudadela · 6 min en coche', t: '22 min en villavesa (L21)', u: 'https://www.booking.com/hotel/es/hostal-pamplona.html', q: 'Iraipe Pamplona Hostal, Calle Berrioplano 2, Pamplona', c: [-1.64700, 42.83093] },
    { id: 'burlada', mapa: 'Hotel Burlada', n: 'Hotel Burlada', p: '€', m: '2★ · Calle La Fuente, 2A · Burlada', d: 'A 4,4 km de la Ciudadela · 7 min en coche', t: '20 min en villavesa (L4)', u: 'https://www.hotelburlada.es', q: 'Hotel Burlada, Calle La Fuente 2, Burlada', c: [-1.61716, 42.82566] },
    { id: 'sanfermin', mapa: 'AH San Fermín', n: 'Aparthotel AH San Fermín', p: '€€€', m: '4★ · Avenida de Villava, 90 · Burlada', d: 'A 4,8 km de la Ciudadela · 7 min en coche', t: '27 min en villavesa (L4)', u: 'https://www.hotelsfpamplona.com', q: 'AH San Fermín Pamplona, Avenida de Villava 90, Burlada', c: [-1.61967, 42.83092] },
    { id: 'jacinto', mapa: 'Casa Jacinto', n: 'Hotel Casa Jacinto', p: '€€', m: '2★ · Polígono Mugazuri, 11C · Burlada', d: 'A 4,8 km de la Ciudadela · 7 min en coche', t: '26 min en villavesa (L7 + L4)', u: 'https://www.hcasajacinto.com', q: 'Hotel Casa Jacinto, Polígono Mugazuri 11C, Burlada', c: [-1.62142, 42.83065] },
    { id: 'andia', mapa: 'Hotel Andia', n: 'Hotel Andia', p: '€€', m: '4★ · Calle Ipertegui, 1 · Orcoyen', d: 'A 4,3 km de la Ciudadela · 7 min en coche', t: '19 min en villavesa (L10, cada 30 min)', u: 'https://www.hotelandia.com', q: 'Hotel Andia, Calle Ipertegui 1, Orcoyen', c: [-1.69424, 42.82198] },
  ]},
];

// Rótulos de zona en el mapa
const ZONAS = [
  { n: 'CASCO ANTIGUO', c: [-1.6525, 42.8213] },
  { n: 'CORDOVILLA', c: [-1.6335, 42.7920] },
  { n: 'ROCHAPEA', c: [-1.6510, 42.8287] },
  { n: 'BERRIOZAR', c: [-1.6690, 42.8360] },
  { n: 'BURLADA', c: [-1.6170, 42.8205] },
];
