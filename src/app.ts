import {createBot, createFlow, MemoryDB, createProvider, addKeyword} from '@bot-whatsapp/bot'
import {BaileysProvider, handleCtx} from '@bot-whatsapp/provider-baileys'
import {parse} from 'date-fns'

let dataMake;

const main = async () => {

    const urlMake = "https://hook.us1.make.com/opxjv6941lnu3k9j9iqwqo1x2e78bi0g"
    const provider = createProvider(BaileysProvider)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0) //Omite la hora actual para comparar sola las fechas

    try {
        const response = await fetch(urlMake, {
            method: 'GET'
        })
        dataMake = await response.json();
        }
    catch (error) {
        console.error(error);
    }

    provider.initHttpServer(3002)

    provider.http?.server.post('/send-message', handleCtx(async(bot, req, res) => {
        let consultasManana = false;

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
            res.end("Successfully");
        } else {
            res.end("No hay consultas para mañana");
        }
    }));
}

main()