const express = require('express');
// const WebSocket = require('ws');
// const socket = new WebSocket('ws://localhost:3003');
const fetch = require('node-fetch');
const { colectivoMasCercano } = require('../ubicacion');
const { get } = require('../request');
const { healthCheck } = require('../middleware.js');
const { SERVICIOS } = require('../config');

const TRANSITO = SERVICIOS.cuandoViene;

const app = new express();

app.use(healthCheck);

app.get('/cuando-viene/:parada', async (req, res) => {
    try {
        const parada = req.params.parada;
        const response = await fetch(`http://localhost:3000/paradas/${parada}`, {
                method: 'GET',
                timeout: 8000
        })
        const {ubicacion, lineas} = await response.json();
    
        let detalleDeLasLineas = [];
    
        for(const linea of lineas) {
            const response = await fetch(`http://localhost:3001/lineas/${linea}`, {
                    method: 'GET',
                    timeout: 8000
            })
            const informacionLinea = await response.json();
    
            detalleDeLasLineas.push({
                linea,
                colectivos: informacionLinea.colectivos
            });
        }
    
        const tiemposDeLLegadaPorLinea = detalleDeLasLineas.map( detalle => {
           return colectivoMasCercano(detalle, ubicacion);
        })

        // Queremos obtener, para cada linea de la parada, el próximo colectivo que va a llegar
        res.json(tiemposDeLLegadaPorLinea); 
    } catch (error) {
        console.log(error);
        res.json(error); 
    }
    
});

app.listen(TRANSITO.puerto, () => {
    console.log(`[${TRANSITO.nombre}] escuchando en el puerto ${TRANSITO.puerto}`);
});

// function mensaje(contenido) {
//     const esTexto = typeof contenido === 'string';
//     return JSON.stringify({ msg: contenido, type: esTexto ? 'texto' : 'estados' });
// }