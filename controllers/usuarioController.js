import { check, validationResult } from "express-validator";
import bcrypt from 'bcrypt';
import Usuario from "../models/Usuario.js";
import {generarJWT, generarId } from "../helpers/tokens.js";
import { emailRegistro , emailOlvidePassword} from "../helpers/emails.js";


const formularioLogin = (req,res) =>{
    res.render('auth/login',{
          pagina:'Iniciar Sesion',
          csrfToken:req.csrfToken()
        
    })
}


const autenticar  = async (req, res)=>{
   //Validacion
    await check('email').isEmail().withMessage('El Email es Obligatorio').run(req);
    await check('password').notEmpty().withMessage('El Password es Obligatorio').run(req)

    let resultado=validationResult(req);

    //Verificar que el usuario no este vacio

    if(!resultado.isEmpty()){
        //Erores
        return   res.render('auth/login',{
            pagina:'Iniciar Sesion',
            csrfToken:req.csrfToken(),
            errores:resultado.array()
          
      })
    }


    const {email,password}=req.body;
    //Comprobar si el usuario existe
    const usuario = await Usuario.findOne({where:{email}});
    if(!usuario){
        return   res.render('auth/login',{
            pagina:'Iniciar Sesion',
            csrfToken:req.csrfToken(),
            errores:[{msg:'El Usuario No Existe'}]
          
      })
    }
    //Comprobar si el usaurio esta confirmado
    if(!usuario.confirmado){
        return   res.render('auth/login',{
            pagina:'Iniciar Sesion',
            csrfToken:req.csrfToken(),
            errores:[{msg:'Tu cuenta no ha sido confirmada'}]
          
      })
    }

    //Revisar el Password
    if(!usuario.verificarPassword(password)){
        return   res.render('auth/login',{
            pagina:'Iniciar Sesion',
            csrfToken:req.csrfToken(),
            errores:[{msg:'El password es incorrecto'}]
          
      })
    }

    //Autenticar al Usuario
    const token = generarJWT({id:usuario.id,nombre:usuario.nombre});
    console.log(token);

    //Almacenar en un Cookie
    return  res.cookie('_token', token, {
        httpOnly:true
    }).redirect('/mis-propiedades')


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
        pagina:'Recupera tu Acceso a Bienes Raices',
        csrfToken:req.csrfToken()
    })
}


const  resetPassword = async (req, res) =>{
        //Validacion 
        await check('email').isEmail().withMessage('Eso no parece un Email').run(req);
        let resultado=validationResult(req);
        //Verificar que el resultado este vacio
        if(!resultado.isEmpty()){
            //Erores
            return   res.render('auth/olvide-password',{
                pagina:'Recupera tu Acceso a Bienes Raices',
                csrfToken:req.csrfToken(),
                errores: resultado.array()
              
          })
        }
        //Buscar el usuario
        const {email} = req.body

        const usuario = await Usuario.findOne({where:{email}})
       
        if(!usuario){
            return   res.render('auth/olvide-password',{
                pagina:'Recupera tu Acceso a Bienes Raices',
                csrfToken:req.csrfToken(),
                errores: [{msg:'El Email no pertenece a ningun usuario'}]
              
          })
        }
        //Generar Token y enviar email

        usuario.token=generarId();
        await usuario.save();

        //Enviar un email
        emailOlvidePassword({
            email:usuario.email,
            nombre:usuario.nombre,
            token:usuario.token
        })

        //Renderizar un mensaje
        res.render('templates/mensaje',{
            pagina:'Reestablece tu password',
            mensaje:'Hemos enviado un email con las instrucciones'
          
      })

    }       


const comprobarToken = async (req, res) =>{
      const {token} = req.params;
      const usuario = await Usuario.findOne({where:{token}})
      if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina:'Reestabece tu Password',
            mensaje:'Hubo un error al validar tu informacion, intenta de nuevo',
            error:true
       })
      }
      //Mostrar Formulario para Modificar el Password
      res.render('auth/reset-password',{
            pagina:'Reestablece tu Contraseña',
            csrfToken:req.csrfToken()
      })
}


const nuevoPassword = async (req, res) =>{
    
    //Validar el password
    await check('password').isLength({min:6}).withMessage('El Password debe ser al menos 6 Caracteres').run(req)

    let resultado=validationResult(req);
    //Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //Erores
        return   res.render('auth/reset-password',{
            pagina:'Reeestablecer tu Password',
            csrfToken:req.csrfToken(),
            errores:resultado.array(),
    
          
      })
    }

    const {token}= req.params
    const {password}=req.body;

    const usuario = await Usuario.findOne({where:{token}})
    //Identificar quien hacer el cambio
                const salt= await bcrypt.genSalt(10)
                usuario.password= await bcrypt.hash(password, salt);
                usuario.token=null;

                await usuario.save();

                res.render('auth/confirmar-cuenta',{
                    pagina:'Password Reestablecido',
                    mensaje:'El Password se Guardo Correctamente'
                })
    //Hashear el nuevo password
}

export {
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword
   
}