import { check, validationResult } from "express-validator";
import Usuario from "../models/Usuario.js";
import { generarId } from "../helpers/tokens.js";
import { emailRegistro } from "../helpers/emails.js";


const formularioLogin = (req,res) =>{
    res.render('auth/login',{
          pagina:'Iniciar Sesion'
        
    })
}
const formularioRegistro = (req,res) =>{
    res.render('auth/registro',{
        pagina:'Crear Cuenta'
    })
}

const registrar= async (req,res)=>{
    //Validacion 

    await check('nombre').notEmpty().withMessage('El Nombre no puede ir Vacio').run(req)
    await check('email').isEmail().withMessage('Eso no parece un Email').run(req);
    await check('password').isLength({min:6}).withMessage('El Password debe ser al menos 6 Caracteres').run(req)
    await check('repetir-password').equals(req.body.password).withMessage('Los Password no son iguales').run(req)

    let resultado=validationResult(req);

    //Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //Erores
        return   res.render('auth/registro',{
            pagina:'Crear cuenta',
            errores:resultado.array(),
            usuario:{
                nombre:req.body.nombre,
                email:req.body.email,

            }
          
      })
    }

    //Extraer los datos
    const { nombre , email, password} = req.body



    //Verificar que el usuario no este duplicado
    const existeUsuario =  await  Usuario.findOne({
        where:{email}
    })

    if(existeUsuario){
        return   res.render('auth/registro',{
            pagina:'Crear cuenta',
            errores:[{msg:'El usuario ya esta Registrado'}],
            usuario:{
                nombre:req.body.nombre,
                email:req.body.email,

            }
          
      })
    }

   //Almacenar un usuario
    const usuario = await Usuario.create({
            nombre,
            email,
            password,
            token:generarId()   
    })


    //Envia email de confirmacion
    emailRegistro({
        nombre:usuario.nombre,
        email:usuario.email,
        token:usuario.token
    })



    //Mostrar mensaje de confirmacion
    res.render('templates/mensaje',{
        pagina:'Cuenta Creata Correctamente',
        mensaje:'Hemos enviado un email de confirmacion presiona en el enlace'
    })
        
}


const formularioOlvidePassword = (req,res) =>{

    res.render('auth/olvide-password',{
        pagina:'Recupera tu Acceso a Bienes Raices'
    })
}

export {
    formularioLogin,
    formularioRegistro,
    formularioOlvidePassword,
    registrar
}