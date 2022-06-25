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
        values: [email, nombre, password, anosExperiencia, especialidad, foto, 0],
    }

    try {
        const result = await pool.query(SQLQuery)
        return result.rows[0]
    } catch (error) {
        console.log(error)
        return error
    }
}

const loginSkater = async (email, password) => {
    const SQLQuery = {
        text: 'SELECT * FROM skaters WHERE email=$1 AND password=$2',
        values: [email, password]
    }

    try {
        const result = await pool.query(SQLQuery)
        return result.rows[0]
    } catch (error) {
        console.log(error)
        return error
    }
}

const updateSkater = async (newData, id) => {
    const SQLQuery = {
        text: 'UPDATE skaters set nombre=$1, password=$2, anos_experiencia=$3, especialidad=$4 WHERE id=$5 RETURNING *',
        values: [newData.nombre, newData.password, newData.anosExperiencia, newData.especialidad, id]
    }

    try {
        const result = await pool.query(SQLQuery)
        return result.rows[0]
    } catch (error) {
        console.log(error)
        return error
    }
}

const deleteSkater = async (id) => {
    const SQLQuery = {
        text: 'DELETE FROM skaters WHERE id=$1',
        values: [id]
    }

    try {
        const result = await pool.query(SQLQuery)
        return result.rowCount
    } catch (error) {
        console.log(error)
        return error
    }
}

const updateCheckbox = async (body) => {
    const SQLQuery = {
        text: 'UPDATE skaters set estado=$1 WHERE id=$2 RETURNING *',
        values: [body.estado, body.id]
    }

    try {
        const result = await pool.query(SQLQuery)
        return result.rows[0]
    } catch (error) {
        console.log(error)
        return error
    }
}

module.exports = { consultarSkaters, registrarSkater, loginSkater, updateSkater, deleteSkater, updateCheckbox }