import pino from 'pino';

export class Logger {
    private pino = pino({
        transport: {
            target: 'pino-pretty',
        },
    });

    info(message: string, data?: object) {
        this.pino.info(data || {}, message);
    }

    error(message: string, error?: unknown) {
        this.pino.error({ error }, message);
    }

    warn(message: string, data?: object) {
        this.pino.warn(data || {}, message);
    }
}