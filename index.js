
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');

// Inicializamos el bot
const SESSION_FILE_PATH = './session.json';
let ws;
let dataSession;

/**
 * Verificamos se salvamos as credenciais para fazer o login 
 * esta etapa evita verificar novamente o QRCODE
 */
const withSession = () => {
    dataSession = require(SESSION_FILE_PATH);
    ws = new Client({ session: dataSession });
    ws.on('ready', () => console.log('Cliente está pronto!'));
    ws.on('auth_failure', () => {
        console.log('** O erro de autenticação regenera o QRCODE (Excluir o arquivo session.json) **');
        fs.unlinkSync('./session.json');
    })
    ws.initialize();
}

/**
 * Geramos um QRCODE para iniciar a sessão
 */
const withOutSession = () => {
    ws = new Client();
    // Geramos o QRCODE no Terminal
    ws.on('qr', qr => { qrcode.generate(qr, { small: true }); });
    ws.on('ready', () => console.log('Cliente está pronto!'));
    ws.on('auth_failure', () => {
        console.log('** O erro de autenticação regenera o QRCODE (Excluir o arquivo session.json) **');
        fs.unlinkSync('./session.json');
    })
    ws.on('authenticated', (session) => {
        dataSession = session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
            if (err) console.log(err);
        });
    });
    ws.initialize();
}

/**
 * Verificamos se existe um arquivo com credenciais!
*/
(fs.existsSync(SESSION_FILE_PATH)) ? withSession() : withOutSession();

/**
 * Enviamos uma mensagem simples (texto) ao nosso cliente
 * @param {*} number 
 */
const sendMessage = (number = null, text = null) => {
    number = number.replace('@c.us', '');
    number = `${number}@c.us`
    const message = text || `Olá, eu sou um BOT`;
    ws.sendMessage(number, message);
}

/**
 * Enviamos arquivos multimídia para nosso cliente
 * @param {*} number
 * @param {*} fileName
 * @param {*} caption
 */
const sendMessageMedia = (number, fileName, caption) => {
    number = number.replace('@c.us', '');
    number = `${number}@c.us`
    const media = MessageMedia.fromFilePath(`./media/${fileName}`)
    ws.sendMessage(number, media, { caption: caption });
}

// API
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true }));

// Controllers
const sendText = (req, res) => {
    const { message, number } = req.body
    sendMessage(number, message)
    res.send({ status: 'Enviado mensagem!' })
}

const sendMidia = (req, res) => {
    const { number, fileName, caption } = req.body
    sendMessageMedia(number, fileName, caption)
    res.send({ status: 'Enviado mensagem multimidia!' })
}

// Rotas
app.post('/send', sendText);
app.post('/sendMedia', sendMidia);

// Ativar o Servidor
app.listen(9000, () => console.log('Server ready!'));