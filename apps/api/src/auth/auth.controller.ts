import {
    Controller,
    Response,
    Get,
    Param,
    UseGuards,
    Request,
    Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

class GetMessageResponse {
    message: string;
}

type Wallet = {
    id: string;
    loginNonce?: string | null;
};

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Get('request-message/:walletAddress')
    async getMessage(
        @Param('walletAddress') walletAddress: string,
    ): Promise<GetMessageResponse> {
        const nonce = await this.authService.updateNonce(walletAddress);

        return { message: `${process.env.JWT_SIGN_MESSAGE}${nonce}` };
    }

    @Get('message-login/:walletAddress/:signedMessage')
    async loginWithMessage(
        @Response()
        res: {
            cookie: (
                key: string,
                token: string,
                params: {
                    expires: Date;
                    sameSite: string;
                    secure: boolean;
                    httpOnly: boolean;
                },
            ) => void;
            send: () => void;
        },
        @Param('walletAddress') walletAddress: string,
        @Param('signedMessage') signedMessage: string,
    ) {
        const { token, exp } = await this.authService.loginWithMessage(
            walletAddress,
            signedMessage,
        );

        res.cookie('accessToken', token, {
            expires: new Date(exp * 1000),
            // sameSite: process.env.NODE_ENV !== 'production' ? 'none' : 'strict',
            sameSite: 'none',
            secure: true,
            httpOnly: true,
        });

        return res.send();
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(
        @Request() req: Request & { user: { id: string } },
    ): Promise<Partial<Wallet>> {
        const result = this.authService.me(req);

        return result;
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    logout(@Response({ passthrough: true }) res) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        res.clearCookie('accessToken', {
            httpOnly: true,
            // sameSite: process.env.NODE_ENV !== 'production' ? 'none' : 'strict',
            sameSite: 'none',
            secure: true,
        });
    }

    //   @HttpCode(HttpStatus.OK)
    //   @Post('login')
    //   signIn(@Body() signInDto: User) {
    //     return this.authService.signIn(signInDto.username, signInDto.password);
    //   }

    //   @UseGuards(AuthGuard)
    //   @Get('profile')
    //   getProfile(@Request() req) {
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    //     return req.user;
    //   }
}
