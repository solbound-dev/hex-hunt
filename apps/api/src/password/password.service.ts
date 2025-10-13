import { BadRequestException, Injectable } from '@nestjs/common';
import bs58 from 'bs58';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import nacl = require('tweetnacl');

@Injectable()
export class PasswordService {
  validateMessageSignature(
    publicKey: string,
    signature: string,
    nonce?: string | null,
  ): boolean {
    const message = `${process.env.JWT_SIGN_MESSAGE}${nonce}`;
    // const message = `aa${nonce}`;
    const messageBytes = new TextEncoder().encode(message);

    const publicKeyBytes = bs58.decode(publicKey);
    const signatureBytes = bs58.decode(signature);

    const result = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes,
    );

    if (!result) {
      throw new BadRequestException('Invalid signature!');
    }
    return true;
  }
}
