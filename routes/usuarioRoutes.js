import express from 'express';
import { formularioLogin,registrar, formularioOlvidePassword, formularioRegistro, confirmar } from '../controllers/usuarioController.js';

const router= express.Router();
router.get('/login',formularioLogin)
router.get('/registro', formularioRegistro)
router.post('/registro', registrar)
router.get('/olvide-password', formularioOlvidePassword )
router.get('/confirmar/:token',confirmar)
export default router;  

