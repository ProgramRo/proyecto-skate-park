const registrarSkater = () => {
    $('button').click(async () => {
        const email = $('#email').val()
        const nombre = $('#nombre').val()
        const password = $('#password').val()
        const anosExperiencia = $('#anos-experiencia').val()
        const especialidad = $('#especialidad').val()
        const foto = $('#foto').val()

        const payload = { email, nombre, password, anosExperiencia, especialidad, foto }

        try {
            await axios.post('/skaters', payload)
            alert('Skater registrado con éxito!')

            window.location.href = '/login'
        } catch ({ response }) {
            const { data } = response
            const { error } = data
            alert(error)
        }
    })
}

module.exports = { registrarSkater }