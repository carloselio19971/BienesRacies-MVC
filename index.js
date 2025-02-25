import express from 'express';  //Emma SCRIPT MODULOS
import usuarioRoutes from './routes/usuarioRoutes.js';
import db from './config/db.js'
//Crear la app
const app=express()

//Habilitar lectura de datos del formulario
app.use(express.urlencoded({extended:true}))


//Habilitar Pug
app.set('view engine','pug')
app.set('views','./views')

//Conexion a la base de datos
try {
    await db.authenticate();
    db.sync()
    console.log("Conexion Correcta a la base de datos");
} catch (error) {
    console.log("Error en Conexion Base de Datos");
}


//Carpeta Pùblica
app.use(express.static('public'))

//Routing
app.use('/auth', usuarioRoutes)


//Definir un puerto y arrancar un proyecto
const port=3000;
app.listen(port,()=>{
    console.log(`El Servidor esta funcionando en el puerto ${port}`)
})