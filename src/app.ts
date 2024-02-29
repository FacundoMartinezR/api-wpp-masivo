import {createBot, createFlow, MemoryDB, createProvider, addKeyword} from '@bot-whatsapp/bot'
import {BaileysProvider, handleCtx} from '@bot-whatsapp/provider-baileys'
import {parse} from 'date-fns'

const main = async () => {

    const urlMake = "https://hook.us1.make.com/opxjv6941lnu3k9j9iqwqo1x2e78bi0g"
    const provider = createProvider(BaileysProvider)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0) //Omite la hora actual para comparar sola las fechas

    provider.initHttpServer(3002)

    provider.http?.server.post('/send-message', handleCtx(async(bot, req, res) => {
        let consultasManana = false;
        let dataMake;

        try {
            const response = await fetch(urlMake, {
                method: 'GET'
            })
            dataMake = await response.json();
            }
        catch (error) {
            console.error(error);
        }    

        for (const item of dataMake) {
            const fechaConsulta = parse(item.dateDay, 'dd/MM/yyyy', new Date());
            fechaConsulta.setHours(0, 0, 0, 0) //Omite la hora de la fecha de la consulta para comparar sola las fechas

            const diferenciaDias = (fechaConsulta.getTime() - hoy.getTime()) / (1000 * 60 * 60 *24);

            if (diferenciaDias === 1) {
                const nombre = item.name;
                const phone = item.phone;
                const dateDay = item.dateDay;
                const dateHour = item.dateHour;
                const message = `Hola ${nombre}. Desde Centro Médico Integral le recordamos su consulta de fisioterapia para el día: ${dateDay} a la hora: ${dateHour}. Ante cualquier inconveniente de no asistir recuerde llamar al 2347 2347. Muchas gracias!`;
                await bot.sendMessage(phone, message, {});
                consultasManana = true;
            }
        }

        if (consultasManana) {
            res.end("Se ha enviado satisfactoriamente el recordatorio");
        } else {
            res.end("No hay consultas para mañana");
        }
    }));
    // Espera un momento para asegurar que el servidor está listo
   /* setTimeout(() => {
        // Realiza la solicitud POST a /send-message
        fetch('http://localhost:3002/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}) // Ajusta el cuerpo según sea necesario
        })
        .then(response => response.text()) // Ajusta según el tipo de respuesta esperada
        .then(result => {
            console.log(result);
            // Finaliza el proceso después de procesar la respuesta
            process.exit(0);})
            .catch(error => {
                console.error('Error al enviar mensaje:', error);
                // Finaliza el proceso con un código de error
                process.exit(1);
            });    }, 1000);*/ // Ajusta este tiempo según sea necesario para esperar a que el servidor esté listo
};

main()