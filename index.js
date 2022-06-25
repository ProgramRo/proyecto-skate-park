const url = require('url')
const express = require('express')
const app = express()
const { engine } = require('express-handlebars')
const expressFileUpload = require('express-fileupload')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const path = require('path')
const { consultarSkaters, registrarSkater, loginSkater, updateSkater, deleteSkater, updateCheckbox } = require('./src/rutas/consultas')
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
        res.render('mainLayout/index', {
            mensaje: `Hubo un error. Por favor, revise la siguiente información: ${error}`
        })
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
app.get('/admin', async (req, res) => {
    try {
        const skaters = await consultarSkaters()
        res.render('Admin', {
            datosSkaters: skaters
        })
    } catch (error) {
        res.render('Admin', {
            mensaje: `Hubo un error. Por favor, revise la siguiente información: ${error}`
        })
    }
})

// Ruta datos
app.get('/datos', (req, res) => {
    const { token } = url.parse(req.url, true).query
    jwt.verify(token || '', secretKey, async (err, decoded) => {
        if (err) {
            res.status(401).send({
                error: '401 Acceso no autorizado.',
                message: err.message
            })
        } else {
            res.render('Datos', {
                token: token,
                data: decoded.data
            })
        }
    })
})

// Ruta para actualizar datos
app.put('/update/:id', async(req, res) => {
    try {
        const { id } = req.params
        const token = req.header('authorization')
        const body = req.body

        if (body.password === '') {
            res.json({
                status: false,
                message: 'La contraseña es inválida o se encuentra vacía'
            })
        } else if(body.password != body.repitaPassword) {
            res.json({
                status: false,
                message: 'La contraseñas deben coincidir'
            })
        } else {
            jwt.verify(token || '', secretKey, async (err, decoded) => {
                if (err) {
                    res.status(401).send({
                        error: '401 Acceso no autorizado.',
                        message: err.message
                    })
                } else {
                    const newData = await updateSkater(body, id)
                    if(newData) {
                        const token = jwt.sign({
                            exp: Math.floor(Date.now()/1000) + 120,
                            data: newData
                        }, secretKey)
                        res.json({
                            status: true,
                            token: token
                        })
                    } else {
                        res.json({
                            status: false,
                            message: 'No se han podido actualizar los datos. Intente nuevamente.'
                        })
                    }
                }
            })
        }
    } catch (error) {
        res.render('Datos', {
            mensaje: `Hubo un error. Por favor, revise la siguiente información: ${error}`
        })
    }
})

app.put('/checkbox', async (req, res) => {
    try {
        const token = req.header('authorization')
        const body = req.body
        jwt.verify(token || '', secretKey, async (err, decoded) => {
            if (err) {
                res.status(401).send({
                    error: '401 Acceso no autorizado.',
                    message: err.message
                })
            } else {
                const newData = await updateCheckbox(body)
                if(newData) {
                    res.json({
                        status: true
                    })
                } else {
                    res.json({
                        status: false
                    })
                }
            }
        })
    } catch (error) {
        res.render('Admin', {
            mensaje: `Hubo un error. Por favor, revise la siguiente información: ${error}`
        })
    }
})

app.delete('/delete/:id', async(req, res) => {
    try {
        const { id } = req.params
        const token = req.header('authorization')
        jwt.verify(token || '', secretKey, async (err, decoded) => {
            if (err) {
                res.status(401).send({
                    error: '401 Acceso no autorizado.',
                    message: err.message
                })
            } else {
                const newData = await deleteSkater(id)
                if(newData > 0) {
                    res.json({
                        status: true
                    })
                } else {
                    res.json({
                        status: false
                    })
                }
            }
        })
    } catch (error) {
        res.render('Datos', {
            mensaje: `Hubo un error. Por favor, revise la siguiente información: ${error}`
        })
    }
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
                res.statusCode = 201
                res.render('Login', {
                    mensaje: `Cuenta creada con éxito!`
                })
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
    try {
        const datos = req.body
        const skater = await loginSkater(datos.email, datos.password)

        if (skater) {
            const token = jwt.sign({
                exp: Math.floor(Date.now()/1000) + 120,
                data: skater
            }, secretKey)
            res.redirect(`/datos?token=${token}`)
        } else {
            res.render('login', {
                mensaje: 'Acceso incorrecto, verifique sus credenciales.'
            })
        }
    } catch (error) {
        res.render('login', {
            mensaje: `Hubo un error. Por favor, revise la siguiente información: ${error}`
        })
    }
})

// Se crea el servidor
app.listen(3000, () => {
    console.log('El servidor está inicializado en el puerto 3000')
})