/* ==========================================================
   Datos de la boda: lugares y alojamientos.
   El mapa y las fichas de "Dónde dormir" leen de aquí:
   si cambias algo, cambia en los dos sitios.
   Coordenadas: [longitud, latitud].
   ========================================================== */

// Botón «Abrir en Google Maps» del globo: maps = enlace directo a la ficha; si no hay, q = lo que se busca; si tampoco, las coordenadas exactas.
const LUGARES = {
  // Coordenadas de la Sala Lidia Biurrun (ficha de Google Maps), dentro de la Ciudadela
  ceremonia: { nombre: 'Ceremonia · Ciudadela', detalle: '18:30 · Sala Lidia Biurrun', c: [-1.6499994, 42.8111432], maps: 'https://maps.google.com/?cid=5790998974073306792' },
  banquete:  { nombre: 'Banquete · Asador Erreleku', detalle: '20:00 · cóctel, cena y fiesta', c: [-1.64569, 42.78839], q: 'Asador Erreleku, Cordovilla' },
  // Donde nos dimos el primer beso (en el mapa sale con un corazón gris, sin más explicación)
  // Puntos especiales (especial: true): en el mapa salen con un corazón gris
  taconera:  { nombre: 'Un punto especial en la Taconera', detalle: 'Jardines de la Taconera', c: [-1.652197, 42.818696], especial: true },
  txantrea:  { nombre: 'Un punto especial en la Txantrea', detalle: 'Txantrea', c: [-1.632017, 42.831985], especial: true },
};

// Bloques de alojamiento. Precio: nivel orientativo (€ a €€€€€).
// d = distancia a la Ciudadela; t = villavesa (opcional); u = web; q = búsqueda en Google Maps.
// Enlaces de Booking: con las fechas de la boda ya puestas (viernes 25 a domingo 27 de junio de 2027, 2 adultos).
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
  { id: 'cordovilla', titulo: 'A un paso del banquete', color: 'oliva', hoteles: [
    { id: 'bed4u', mapa: 'Bed4u', n: 'Hotel Bed4u Pamplona', p: '€', m: '3★ · Ctra. de Zaragoza, km 3 · Cordovilla', d: 'A 3,9 km de la Ciudadela · 7 min en coche', t: '22 min en villavesa (L16)', u: 'https://www.bed4uhotels.com', q: 'Hotel Bed4u Pamplona, Cordovilla', c: [-1.63992, 42.79000] },
    { id: 'zenit', mapa: 'Zenit', n: 'Hotel Zenit Pamplona', p: '€€', m: '4★ · Parque Comercial Galaria', d: 'A 4,6 km de la Ciudadela · 8 min en coche', t: '27 min en villavesa (L11)', u: 'https://pamplona.zenithoteles.com', q: 'Hotel Zenit Pamplona, Galaria', c: [-1.63202, 42.78724] },
    { id: 'holiday', mapa: 'Holiday Inn Express', n: 'Holiday Inn Express Pamplona', p: '€€', m: '3★ · Galaria, Mutilva Baja · desayuno incluido', d: 'A 5,2 km de la Ciudadela · 10 min en coche', t: '34 min en villavesa (L11)', u: 'https://www.ihg.com/holidayinnexpress/hotels/es/es/pamplona/pnasp/hoteldetail', q: 'Holiday Inn Express Pamplona, Galaria', c: [-1.62796, 42.78327] },
  ]},
  { id: 'coche', titulo: 'Un poco más lejos', color: 'pizarra', hoteles: [
    { id: 'iraipe', mapa: 'Hostal Iraipe', n: 'Iraipe Pamplona Hostal', p: '€', m: '3★ · Hostal · Calle Berrioplano, 2 · Ansoáin', d: 'A 2,8 km de la Ciudadela · 6 min en coche', t: '22 min en villavesa (L21)', u: 'https://www.booking.com/hotel/es/hostal-pamplona.html?checkin=2027-06-25&checkout=2027-06-27&group_adults=2&no_rooms=1&group_children=0', q: 'Iraipe Pamplona Hostal, Calle Berrioplano 2, Pamplona', c: [-1.64700, 42.83093] },
    { id: 'burlada', mapa: 'Hotel Burlada', n: 'Hotel Burlada', p: '€', m: '2★ · Calle La Fuente, 2A · Burlada', d: 'A 4,4 km de la Ciudadela · 7 min en coche', t: '20 min en villavesa (L4)', u: 'https://www.hotelburlada.es', q: 'Hotel Burlada, Calle La Fuente 2, Burlada', c: [-1.61716, 42.82566] },
    { id: 'sanfermin', mapa: 'AH San Fermín', n: 'Aparthotel AH San Fermín', p: '€€€', m: '4★ · Avenida de Villava, 90 · Burlada', d: 'A 4,8 km de la Ciudadela · 7 min en coche', t: '27 min en villavesa (L4)', u: 'https://www.hotelsfpamplona.com', q: 'AH San Fermín Pamplona, Avenida de Villava 90, Burlada', c: [-1.61967, 42.83092] },
    { id: 'jacinto', mapa: 'Casa Jacinto', n: 'Hotel Casa Jacinto', p: '€€', m: '2★ · Polígono Mugazuri, 11C · Burlada', d: 'A 4,8 km de la Ciudadela · 7 min en coche', t: '26 min en villavesa (L7 + L4)', u: 'https://www.hcasajacinto.com', q: 'Hotel Casa Jacinto, Polígono Mugazuri 11C, Burlada', c: [-1.62142, 42.83065] },
    { id: 'andia', mapa: 'Hotel Andia', n: 'Hotel Andia', p: '€€', m: '4★ · Calle Ipertegui, 1 · Orcoyen', d: 'A 4,3 km de la Ciudadela · 7 min en coche', t: '19 min en villavesa (L10, cada 30 min)', u: 'https://www.hotelandia.com', q: 'Hotel Andia, Calle Ipertegui 1, Orcoyen', c: [-1.69424, 42.82198] },
  ]},
];

// Lugares conocidos, solo como referencia para situarse (coordenadas de OpenStreetMap)
const REFERENCIAS = [
  { n: 'Plaza del Castillo', c: [-1.64276, 42.81681], q: 'Plaza del Castillo, Pamplona' },
  { n: 'Ayuntamiento', c: [-1.64419, 42.81843], q: 'Ayuntamiento de Pamplona' },
  { n: 'Catedral', c: [-1.64123, 42.81940], q: 'Catedral de Santa María la Real, Pamplona' },
  // Punto en la puerta del callejón, por donde entran los toros al final del encierro
  { n: 'Plaza de toros', c: [-1.64009, 42.81580], q: 'Plaza de Toros de Pamplona' },
  { n: 'Monumento a los Fueros', c: [-1.64363, 42.81573], q: 'Monumento a los Fueros de Navarra, Paseo de Sarasate, Pamplona' },
  { n: 'Monumento al Encierro', c: [-1.64134, 42.81477], q: 'Monumento al Encierro, Avenida de Roncesvalles, Pamplona' },
  // d = texto corto que sale en el globo, bajo el nombre
  { n: 'Reloj de San Fermín', d: 'La cuenta atrás de Kukuxumusu', c: [-1.6412725, 42.8161351], maps: 'https://maps.google.com/?cid=1127148139565604444' },
  { n: 'Corrales de Santo Domingo', d: 'Donde empieza el encierro', c: [-1.64604, 42.82027], q: 'Corrales de Santo Domingo, Pamplona' },
  // maps = enlace directo a su ficha de Google Maps (buscando por nombre salía también el Mesón del Caballo Blanco)
  { n: 'Rincón del Caballo Blanco', c: [-1.6413152, 42.8210107], maps: 'https://maps.google.com/?cid=13520882529087779968' },
  { n: 'Fuente de la Navarrería', d: 'Zona para tomar algo', c: [-1.64291, 42.81932], q: 'Plaza de la Navarrería, Pamplona' },
  { n: 'Estación de autobuses', c: [-1.64592, 42.81131], q: 'Estación de Autobuses de Pamplona' },
  { n: 'Estación de tren', c: [-1.66132, 42.82502], q: 'Estación de tren de Pamplona' },
  // Queda al sur del encuadre inicial: se ve al bajar por el mapa
  { n: 'Aeropuerto', c: [-1.63932, 42.76722], q: 'Aeropuerto de Pamplona' },
];

// Calles para ir de pintxos: en el mapa, una franja gris suave sobre la calle con su nombre a lo largo.
// linea = trazado de la calle (de OpenStreetMap), [longitud, latitud] punto a punto.
const CALLES = [
  { n: 'Calle Estafeta', d: 'Zona de pintxos', q: 'Calle Estafeta, Pamplona',
    linea: [[-1.64111,42.81598],[-1.64115,42.81603],[-1.64133,42.81628],[-1.64150,42.81654],[-1.64210,42.81740],[-1.64299,42.81845],[-1.64301,42.81849]] },
  { n: 'Calle San Nicolás', d: 'Zona de pintxos', q: 'Calle San Nicolás, Pamplona',
    linea: [[-1.64341,42.81676],[-1.64356,42.81673],[-1.64383,42.81665],[-1.64387,42.81663],[-1.64499,42.81612],[-1.64552,42.81586]] },
];

// Rótulos de zona en el mapa
const ZONAS = [
  { n: 'CASCO ANTIGUO', c: [-1.6525, 42.8213] },
  { n: 'CORDOVILLA', c: [-1.6335, 42.7920] },
  { n: 'ROCHAPEA', c: [-1.6510, 42.8287] },
  { n: 'BERRIOZAR', c: [-1.6690, 42.8360] },
  { n: 'BURLADA', c: [-1.6170, 42.8205] },
];
