  import nodemailer from 'nodemailer';

  const emailRegistro=async (datos) =>{

        console.log("USER:", process.env.EMAIL_USER);
        console.log("PASS:", process.env.EMAIL_PASSWORD);


          const  transport = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
              user: process.env.EMAIL_USER ,
              pass:  process.env.EMAIL_PASSWORD
            }
          });
        
          const {email,nombre,token}=datos;

       
          //Enviar el email
          await transport.sendMail({
              from:'BienesRacies.com',
              to: email,
              subject:'Confirma tu cuenta en BienesRacies.com',
              text:'Confirma tu cuenta en BienesRacies.com',
              html:`
                  <p>Hola ${nombre}, comprueba tu cuenta en BienesRacies.com</p>
                  
                  <p>Tu cuenta ya esta lista solo debes confirmala  en el siguiente en enlaces:
                  <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar cuenta</a>
                  </p>

                  <p>Si tu no creaste esta cuenta entonces puede ignorar el mensaje</p>
              `
          })
  }

  const emailOlvidePassword=async (datos) =>{

    console.log("USER:", process.env.EMAIL_USER);
    console.log("PASS:", process.env.EMAIL_PASSWORD);


      const  transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER ,
          pass:  process.env.EMAIL_PASSWORD
        }
      });
    
      const {email,nombre,token}=datos;

   
      //Enviar el email
      await transport.sendMail({
          from:'BienesRacies.com',
          to: email,
          subject:'Reestablece tu password en BienesRacies.com',
          text:'Reestablece tu password en BienesRacies.com',
          html:`
              <p>Hola ${nombre}, has solicitado reestrablecer tu password en BienesRacies.com</p>
              
              <p>Sigue el siguiente enlace para generar un password nuevo:
              <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Reestrablecer Password</a>
              </p>
              <p>Si tu no solicitastes el cambio de password puedes ignorar este mensaje</p>
          `
      })
}

  export {
      emailRegistro,
      emailOlvidePassword
  }