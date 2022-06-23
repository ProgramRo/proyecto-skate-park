const { Pool } = require('pg')

const config = {
    user: "postgres",
    host: "localhost",
    password: "1234",
    database: "skatepark_db",
    port: 5432,
}

const pool = new Pool(config)

const consultarSkaters = async () => {
    try {
        const result = await pool.query('SELECT * FROM skaters')
        return result.rows
    } catch (error) {
        console.log(error)
        return error
    }
}

const registrarSkater = async (email, nombre, password, anosExperiencia, especialidad, foto) => {
    const SQLQuery = {
        text: 'INSERT INTO skaters(email, nombre, password, anos_experiencia, especialidad, foto, estado) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        values: [email, nombre, password, anosExperiencia, especialidad, foto],
    }
    try {
        const result = await pool.query(SQLQuery)
        console.log(result)
        return result
    } catch (error) {
        console.log(error)
        return error
    }
}

module.exports = { consultarSkaters, registrarSkater }