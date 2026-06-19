export const INDIAN_AIRPORTS = [
  { iata:'DEL', name:'Indira Gandhi Intl',   city:'New Delhi',  lat:28.5562, lon:77.1000, hub:true },
  { iata:'BOM', name:'Chhatrapati Shivaji',   city:'Mumbai',     lat:19.0896, lon:72.8656, hub:true },
  { iata:'BLR', name:'Kempegowda Intl',       city:'Bengaluru',  lat:13.1979, lon:77.7063, hub:true },
  { iata:'MAA', name:'Chennai Intl',          city:'Chennai',    lat:12.9941, lon:80.1709 },
  { iata:'CCU', name:'Netaji Subhas Chandra', city:'Kolkata',    lat:22.6520, lon:88.4463 },
  { iata:'HYD', name:'Rajiv Gandhi Intl',     city:'Hyderabad',  lat:17.2403, lon:78.4294 },
  { iata:'PNQ', name:'Pune Airport',          city:'Pune',       lat:18.5822, lon:73.9197 },
  { iata:'GOI', name:'Goa Intl (Dabolim)',    city:'Goa',        lat:15.3808, lon:73.8314 },
  { iata:'JAI', name:'Jaipur Intl',           city:'Jaipur',     lat:26.8242, lon:75.8122 },
  { iata:'AMD', name:'Sardar Vallabhbhai',    city:'Ahmedabad',  lat:23.0772, lon:72.6347 },
]

export const INDIAN_FLIGHTS = [
  { id:'AI-101', callsign:'AIC101', airline:'Air India',  origin:'DEL', destination:'BOM', status:'on-time',   delay:0,  pax:180 },
  { id:'6E-201', callsign:'IGO201', airline:'IndiGo',     origin:'BOM', destination:'BLR', status:'delayed',   delay:25, pax:210 },
  { id:'SG-301', callsign:'SEJ301', airline:'SpiceJet',   origin:'DEL', destination:'HYD', status:'on-time',   delay:0,  pax:145 },
  { id:'AI-202', callsign:'AIC202', airline:'Air India',  origin:'BLR', destination:'CCU', status:'delayed',   delay:40, pax:160 },
  { id:'6E-401', callsign:'IGO401', airline:'IndiGo',     origin:'MAA', destination:'DEL', status:'on-time',   delay:0,  pax:195 },
  { id:'IX-501', callsign:'AXB501', airline:'Air Asia India', origin:'BLR', destination:'GOI', status:'on-time', delay:0, pax:175 },
  { id:'SG-601', callsign:'SEJ601', airline:'SpiceJet',   origin:'PNQ', destination:'BOM', status:'critical',  delay:90, pax:130 },
  { id:'AI-701', callsign:'AIC701', airline:'Air India',  origin:'CCU', destination:'MAA', status:'on-time',   delay:0,  pax:150 },
  { id:'6E-801', callsign:'IGO801', airline:'IndiGo',     origin:'JAI', destination:'BLR', status:'delayed',   delay:15, pax:165 },
  { id:'AI-901', callsign:'AIC901', airline:'Air India',  origin:'AMD', destination:'DEL', status:'on-time',   delay:0,  pax:200 },
]
