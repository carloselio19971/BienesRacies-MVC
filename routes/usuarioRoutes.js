import express from 'express';
import { formularioLogin,autenticar,registrar, formularioOlvidePassword, formularioRegistro, confirmar , resetPassword, comprobarToken, nuevoPassword } from '../controllers/usuarioController.js';

const router= express.Router();
router.get('/login',formularioLogin)
router.post('/login',autenticar)
router.get('/registro', formularioRegistro)
router.post('/registro', registrar)
router.get('/olvide-password', formularioOlvidePassword)
router.post('/olvide-password', resetPassword)
router.get('/confirmar/:token',confirmar)

//Almacena el nuevo password
router.get('/olvide-password/:token', comprobarToken)
router.post('/olvide-password/:token', nuevoPassword)


export default router;  

