"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaClientExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaClientExceptionFilter = class PrismaClientExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        switch (exception.code) {
            case 'P2002': {
                const status = common_1.HttpStatus.CONFLICT;
                response.status(status).json({
                    statusCode: status,
                    message: `Noyoblik cheklovi buzildi: Kiritilgan qiymat tizimda allaqachon mavjud.`,
                    error: 'Conflict',
                });
                break;
            }
            case 'P2003': {
                const status = common_1.HttpStatus.CONFLICT;
                response.status(status).json({
                    statusCode: status,
                    message: `O'chirish imkonsiz: Ushbu ma'lumot boshqa ma'lumotlar bilan bog'langan va foydalanilmoqda.`,
                    error: 'Conflict',
                });
                break;
            }
            case 'P2025': {
                const status = common_1.HttpStatus.NOT_FOUND;
                response.status(status).json({
                    statusCode: status,
                    message: `So'ralgan ma'lumot topilmadi.`,
                    error: 'Not Found',
                });
                break;
            }
            default: {
                const status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
                response.status(status).json({
                    statusCode: status,
                    message: `Tizim xatosi yuz berdi: ${exception.message}`,
                    error: 'Internal Server Error',
                });
                break;
            }
        }
    }
};
exports.PrismaClientExceptionFilter = PrismaClientExceptionFilter;
exports.PrismaClientExceptionFilter = PrismaClientExceptionFilter = __decorate([
    (0, common_1.Catch)(client_1.Prisma.PrismaClientKnownRequestError)
], PrismaClientExceptionFilter);
//# sourceMappingURL=prisma-client-exception.filter.js.map