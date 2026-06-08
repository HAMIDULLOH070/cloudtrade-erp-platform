import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case 'P2002': {
        const status = HttpStatus.CONFLICT;
        response.status(status).json({
          statusCode: status,
          message: `Noyoblik cheklovi buzildi: Kiritilgan qiymat tizimda allaqachon mavjud.`,
          error: 'Conflict',
        });
        break;
      }
      case 'P2003': {
        const status = HttpStatus.CONFLICT;
        response.status(status).json({
          statusCode: status,
          message: `O'chirish imkonsiz: Ushbu ma'lumot boshqa ma'lumotlar bilan bog'langan va foydalanilmoqda.`,
          error: 'Conflict',
        });
        break;
      }
      case 'P2025': {
        const status = HttpStatus.NOT_FOUND;
        response.status(status).json({
          statusCode: status,
          message: `So'ralgan ma'lumot topilmadi.`,
          error: 'Not Found',
        });
        break;
      }
      default: {
        const status = HttpStatus.INTERNAL_SERVER_ERROR;
        response.status(status).json({
          statusCode: status,
          message: `Tizim xatosi yuz berdi: ${exception.message}`,
          error: 'Internal Server Error',
        });
        break;
      }
    }
  }
}
