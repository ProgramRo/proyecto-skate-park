const express = require('express')
const app = express()
const { engine } = require('express-handlebars')
const expressFileUpload = require('express-fileupload')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const path = require('path')
const { consultarSkaters, registrarSkater, loginSkater } = require('./src/rutas/consultas')
const secretKey = 'Shhhh'


// Middlewares
app.use(bodyParser.urlencoded({ extended: false })) // Para poder recibir la carga del archivo a través de un form html
app.use(bodyParser.json()) // Para recibir payload de las consultas put y post
// app.use(express.static(__dirname + '/public')) // Declarar de manera estática el acceso a la carpeta 'public'

// Configuración de fileUpload
app.use(
    expressFileUpload({
        limits: 5_000_000,
        abortOnLimit: true,
        responseOnLimit: 'El tamaño de la imagen supera el límite permitido',
    })
)

app.use('/assets', express.static(path.join(__dirname, 'assets')))
app.use('/css', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'css'))) // Acceso directo a node_modules para encontrar la carpeta que contiene el código CSS instalado

// Configuración de handlebars
app.engine(
    'handlebars',
    engine({
        defaultLayout: 'main',
        layoutsDir: `${__dirname}/views/mainLayout`,
    })
)
app.set('view engine', 'handlebars')

// Ruta inicial
app.get('/', async (req, res) => {
    
    try {
        const skaters = await consultarSkaters()
        res.render('mainLayout/index', {
            datosSkaters: skaters
        })
    } catch (error) {
        
    }
})

// Ruta iniciar sesión
app.get('/login', (req, res) => {
    res.render('Login')
})

// Ruta registro
app.get('/registro', (req, res) => {
    res.render('Registro')
})

// Ruta admin
app.get('/admin', (req, res) => {
    res.render('Admin')
})

// Ruta datos
app.get('/datos', (req, res) => {
    res.render('Datos')
})

// Ruta para registrar nuevo participante
app.post('/registro', async (req, res) => {
    const { email, nombre, password, anosExperiencia, especialidad } = req.body
    const { foto } = req.files
    const rutaImg = path.join(__dirname, 'assets', 'img', foto.name)
    try {
        foto.mv(rutaImg, async (err) => {
            if(err) {
                return res.status(500).send({
                    error: `Algo salió mal... ${err}`,
                    code: 500
                })
            } else {
                const data = await registrarSkater(email, nombre, password, anosExperiencia, especialidad, foto.name)
                res.status(201).send(data)
            }
        })
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
})

// Ruta para hacer login
app.post('/login', async (req, res) => {
    res.render('Login')
    try {
        const datos = req.body
        const skater = await loginSkater(datos.email, datos.password)

        if (skater) {
            const token = jwt.sign({
                exp: Math.floor(Date.now()/1000) + 120,
                data: skater
            }, secretKey)
            const id = skater.id
            res.redirect(`/datos?token=${token}&id=${id}`)
        } else {
            
        }
    } catch (error) {
        
    }
})

// Se crea el servidor
app.listen(3000, () => {
    console.log('El servidor está inicializado en el puerto 3000')
})