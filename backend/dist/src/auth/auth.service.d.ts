import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: {
            role: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
            };
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            roleId: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        role: {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
        };
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        roleId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getRoles(): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
    }[]>;
    getUsers(): Promise<{
        id: string;
        createdAt: Date;
        role: {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
        };
        email: string;
        firstName: string;
        lastName: string;
    }[]>;
}
