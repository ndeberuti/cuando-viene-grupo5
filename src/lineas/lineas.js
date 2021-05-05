const express = require('express');
const fs = require('fs');
const { SERVICIOS } = require('../config');
const { healthCheck } = require('../middleware.js');
const { actualizarUbicaciones } = require('./actualizarUbicaciones');
const lineas = require('./lineas.db.json')

const LINEAS = SERVICIOS.lineas;

const lineasDb = {
    // TODO callback sospechoso
    // buscarEstadoPorLinea(linea, callback) {
    //     return lineas[linea].funciona
    // },
    buscarInformacionDeLinea(linea) {
        return lineas[linea];
    }
};

const app = new express();

app.use(healthCheck);

app.get('/lineas/:linea', (req, res) => {
    const linea = req.params.linea;
    const informacionLinea = lineasDb.buscarInformacionDeLinea(linea);
    if (!informacionLinea.funciona) {
        res.sendStatus(404);
    } else {
        res.json(informacionLinea);
    }
});

app.listen(LINEAS.puerto, () => {
    console.log(`[${LINEAS.nombre}] escuchando en el puerto ${LINEAS.puerto}`);
    actualizarUbicaciones();
});
