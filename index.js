
const fs = require('fs');
const mimeDb = require('mime-db')
const qrcode = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true }));

const SESSION_FILE_PATH = './session.json';
let client;
let sessionData;