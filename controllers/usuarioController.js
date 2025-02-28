import { check, validationResult } from "express-validator";
import Usuario from "../models/Usuario.js";
import { generarId } from "../helpers/tokens.js";
import { emailRegistro } from "../helpers/emails.js";
import csurf from "csurf";


const formularioLogin = (req,res) =>{
    res.render('auth/login',{
          pagina:'Iniciar Sesion'
        
    })
}
const formularioRegistro = (req,res) =>{

    console.log(req.csrfToken())

    res.render('auth/registro',{
        pagina:'Crear Cuenta',
        csrfToken:req.csrfToken()
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
            csrfToken:req.csrfToken(),
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
            csrfToken:req.csrfToken(),
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

//Funcion que comprueba una cuenta 

const confirmar = async (req,res) =>{
    console.log(req.params);
    const {token }= req.params;
    //Verificar si el toke es valido y confirmar la cuenta

    const usuario = await Usuario.findOne({where:{token}})
    console.log(usuario);

    //Confirmar el token
    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
             pagina:'Error el confirmar tu cuenta',
             mensaje:'Hubo un error al confirmar tu cuenta , intenta de nuevo',
             error:true
        })
    }
    //Confirmar la cuenta
     usuario.token=null;
     usuario.confirmado=true;
     await usuario.save();

     res.render('auth/confirmar-cuenta',{
        pagina:'Cuenta Confirmada',
        mensaje:'La cuenta se confirmo Correctamente'
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
    registrar,
    confirmar,
    formularioOlvidePassword
   
}