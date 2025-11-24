import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from 'src/password/password.service';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'src/prisma/prisma.service';
import { Wallet } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UserService,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly passwordService: PasswordService,
    ) {}

    async validateWallet(id: string): Promise<Wallet> {
        if (!id) {
            throw new NotFoundException(`No wallet found`);
        }

        const wallet = await this.prisma.wallet.findUnique({
            where: { id: id },
        });

        if (!wallet) {
            throw new NotFoundException(`No wallet found with address: ${id}`);
        }

        return wallet;
    }

    async loginWithMessage(id: string, signedMessage: string) {
        const wallet = await this.prisma.wallet.findUnique({
            where: {
                id,
            },
        });

        this.passwordService.validateMessageSignature(
            id,
            signedMessage,
            wallet?.loginNonce,
        );

        await this.updateNonce(id);

        const token = this.jwtService.sign({ walletId: id, sub: id });
        const { exp } = this.jwtService.decode<{
            walletId: string;
            sub: string;
            iat: number;
            exp: number;
        }>(token);

        return {
            token,
            exp,
        };
    }

    async updateNonce(id: string): Promise<string> {
        const loginNonce = uuidv4();

        await this.prisma.wallet.upsert({
            where: { id },
            create: {
                id,
                loginNonce,
            },
            update: { loginNonce },
        });

        return loginNonce;
    }

    async me(
        req: Request & { user: { id: string } },
    ): Promise<Partial<Wallet>> {
        const result = this.prisma.wallet.findFirstOrThrow({
            where: {
                id: req.user.id,
            },
            select: {
                id: true,
            },
        });

        return result;
    }

    // async signIn(
    //   username: string,
    //   pass: string,
    // ): Promise<{ access_token: string }> {
    //   const user = await this.usersService.findOne(username);
    //   if (!user) {
    //     throw new UnauthorizedException();
    //   }
    //   if (user?.password !== pass) {
    //     throw new UnauthorizedException();
    //   }
    //   const payload = { username: user.username, sub: user.username };
    //   return { access_token: await this.jwtService.signAsync(payload) };
    // }
}
