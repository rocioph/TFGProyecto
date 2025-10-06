const nodemailer = require('nodemailer');
require('dotenv').config();

//transport objeto que gestiona la conexion
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'zootropolisprotectoradeanimale@gmail.com',
        pass: 'khlt hkpd zzgx ipar'
    },
    tls: {
        rejectUnauthorized: false
    }
});

//funcion que recibe un destinario, un asunto y un html 
const sendMail = async (destinario, asunto, html) => {
    try {
        const mailOptions = { //objeto con las opciones del correo 
            from: 'zootropolisprotectoradeanimale@gmail.com', //direccion remitente
            to: destinario, //destinario 
            subject: asunto,
            html,
            attachments: [  //arreglo de archivos adjuntos
              {
                filename: 'logo.png', 
                path: './routes/logo.png',
                cid: 'logo'
              }
            ]
        };

        await transporter.sendMail(mailOptions); //enviar el email con las opciones de email apuntadas
        console.log('Correo electrónico enviado con éxito.');
    } catch (error) {
        console.error('Error al enviar el correo electrónico:', error);
        throw error;
    }
};

/*
    - title --> titulo que ira en el correo
    - subtitle --> subtitulo o texto descriptivo
    - textBoton --> texto quer aparecera dentro del boton
    - link --> url a la que apunta el boton 
*/ 
function generateRegistrationEmail(title, subtitle, textBoton, link) {
    return `
    <div style="
        max-width: 600px;
        margin: 0 auto;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        border-radius: 20px;
        padding: 40px 30px;
        font-family: 'Poppins', sans-serif;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    ">
        <!-- Header con gradiente -->
        <div style="
            background: linear-gradient(135deg, #94b9ff 0%, #e07a68 100%);
            border-radius: 15px 15px 0 0;
            padding: 25px;
            text-align: center;
            margin: -40px -30px 30px -30px;
        ">
            <h1 style="
                color: white;
                font-size: 28px;
                margin: 0;
                font-weight: 600;
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">
                ${title}
            </h1>
        </div>

        <!-- Logo -->
        <div style="text-align: center; margin: 20px 0 30px 0;">
            <img src="cid:logo" style="
                display: block;
                border-radius: 50%;
                width: 120px;
                height: 120px;
                margin: 0 auto;
                border: 5px solid white;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            " alt="Logo Zootropolis"/>
        </div>

        <!-- Mensaje principal -->
        <div style="
            background: white;
            padding: 30px;
            border-radius: 15px;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        ">
            <p style="
                font-size: 16px;
                line-height: 1.6;
                color: #555;
                text-align: center;
                margin: 0;
            ">
                ${subtitle}
            </p>
        </div>

        <!-- Botón llamativo -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="${link ? link : 'http://localhost:3000'}" style="
                display: inline-block;
                background: linear-gradient(135deg, #94b9ff 0%, #e07a68 100%);
                color: #FFFFFF;
                border: none;
                padding: 18px 40px;
                border-radius: 50px;
                font-size: 18px;
                font-weight: 600;
                font-family: 'Poppins', sans-serif;
                text-align: center;
                text-decoration: none;
                box-shadow: 0 6px 20px rgba(36, 126, 171, 0.4);
                transition: all 0.3s ease;
                letter-spacing: 0.5px;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(36, 126, 171, 0.6)';" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 6px 20px rgba(36, 126, 171, 0.4)';">
                ${textBoton}
            </a>
        </div>

        <!-- Nota de seguridad -->
        <div style="
            background: #fff8e1;
            border-left: 4px solid #ffc107;
            padding: 15px 20px;
            border-radius: 8px;
            margin: 25px 0;
        ">
            <p style="
                font-size: 14px;
                color: #856404;
                margin: 0;
                text-align: center;
                line-height: 1.5;
            ">
                ⚠️ <strong>Importante:</strong> Este enlace expirará en 24 horas por seguridad.
            </p>
        </div>

        <!-- Footer -->
        <div style="
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
        ">
            <h3 style="
                color: #247eab;
                font-size: 20px;
                margin: 0 0 5px 0;
                font-weight: 600;
            ">
                PROTECTORA ANIMAL ZOOTROPOLIS
            </h3>
            <p style="
                font-size: 14px;
                color: #666;
                margin: 5px 0;
            ">
                Protegiendo animales, creando esperanzas
            </p>
            <p style="
                font-size: 12px;
                color: #999;
                margin: 10px 0 0 0;
            ">
                Si tienes alguna duda, contáctanos: zootropolisprotectoradeanimale@gmail.com
            </p>
        </div>
    </div>
    `;
}
   

module.exports = {
    sendMail,
    generateRegistrationEmail
};