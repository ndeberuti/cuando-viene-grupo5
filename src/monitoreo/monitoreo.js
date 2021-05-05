const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { get } = require('../request');
const fetch = require('node-fetch');
const { SERVICIOS } = require('../config');

const MONITOREO = SERVICIOS.monitoreo;

const app = new express();

app.get('/', (res, req) => {
    req.sendFile('index.html', { root: __dirname });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function mensaje(contenido) {
    const esTexto = typeof contenido === 'string';
    return JSON.stringify({ msg: contenido, type: esTexto ? 'texto' : 'estados' });
}

wss.on('connection', (ws) => {
    ws.send(mensaje('¡Conectado al monitoreo de servicios!'));

    setInterval(async () => {
        const res = (await Promise.allSettled([
                    healthLineas(),
                    healthParadas(),
                    healthCuandoViene(),
                    ])).map(settledPromise => settledPromise.value)

        console.log('SETTLED PROMISES', res);
        ws.send(mensaje({estados: res}));
    }, 1000);

    ws.on('close', () => {
        console.log('Se cerró una conexión');
    });
});

server.listen(MONITOREO.puerto, () => {
    console.log(`[${MONITOREO.nombre}] escuchando en el puerto ${MONITOREO.puerto}`);
});

async function healthLineas() {
   return await fetch(`http://localhost:3001/health`, {
                    method: 'GET',
                    timeout: 8000   
                    })
                    .then(async (response) => {
                        const { status } = await response.json();
                        return { servicio: 'lineas', status};
                    }).catch(() => {
                        return { servicio: 'lineas', status: 'DOWN'};
                    })
    }

async function healthParadas() {
    try {
        const response = await fetch(`http://localhost:3000/health`, {
            method: 'GET',
            timeout: 8000   
        })
        
        const { status } = await response.json();
        return { servicio: 'paradas', status};
    } catch (error) {
        return { servicio: 'paradas', status: 'DOWN'};
    }
}

async function healthCuandoViene() {
    try {
        const response = await fetch(`http://localhost:3002/health`, {
        method: 'GET',
        timeout: 8000   
        })
    
        const { status } = await response.json();
        return { servicio: 'cuandoViene', status};
    } catch (error) {
        return { servicio: 'cuandoViene', status: 'DOWN'}
    }
}
