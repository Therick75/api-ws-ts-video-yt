import "dotenv/config";
import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from "@bot-whatsapp/bot";
import { BaileysProvider, handleCtx } from "@bot-whatsapp/provider-baileys";

const flowBienvenida = addKeyword("Hola").addAnswer("¡Buenas! ¡Bienvenido!");

const main = async () => {
    const provider = createProvider(BaileysProvider);
    provider.initHttpServer(3002);

    // Endpoint para enviar mensajes dinámicos
    provider.http?.server.post(
        "/send-message",
        handleCtx(async (bot, req, res) => {
            const body = req.body;

            // Obtener los datos del cuerpo de la solicitud
            const recipientNumber = body.number; // Número dinámico
            const message = body.message; // Mensaje dinámico
            const mediaUrl = body.mediaUrl; // URL de archivo multimedia (opcional)

            // Validar los parámetros necesarios
            if (!recipientNumber || !message) {
                res.end(
                    JSON.stringify({
                        error: "Faltan parámetros: 'number' y 'message' son requeridos",
                    })
                );
                return;
            }

            try {
                // Enviar mensaje a través del bot
                await bot.sendMessage(recipientNumber, message, {
                    media: mediaUrl, // Si hay mediaUrl, se incluye
                });

                // Responder éxito
                res.end(
                    JSON.stringify({
                        success: true,
                        message: `Mensaje enviado a ${recipientNumber}`,
                    })
                );
            } catch (error) {
                // Manejar errores
                console.error("Error enviando mensaje:", error);
                res.end(
                    JSON.stringify({
                        success: false,
                        error: "Error enviando mensaje. Revisa el log del servidor.",
                    })
                );
            }
        })
    );

    // Configuración del bot
    await createBot({
        flow: createFlow([flowBienvenida]),
        database: new MemoryDB(),
        provider,
    });
};

main();