import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
} from '@simplewebauthn/server';
import type {
    AuthenticationResponseJSON,
    CredentialDeviceType,
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialRequestOptionsJSON,
    RegistrationResponseJSON,
} from '@simplewebauthn/typescript-types';
import type { Guardbox } from '..';
import { base64urlToBytes, bytesToBase64url } from '../utils';

export type PasskeyMetadata = {
    id: string;
    pabulickKey: string;
    counter: number;
    deviceType: CredentialDeviceType;
    backedUp: boolean;
};

export class PasskeyProvider {
    public providerName = 'passkey';

    constructor(
        private config: { rpID: string; rpName: string; origin: string },
    ) {}

    private passkeyChallengeCookieKey(auth: Guardbox): string {
        return `${auth.appName}-guardbox-passkey-challenge`;
    }

    public async getRegistrationOptions(
        auth: Guardbox,
        username: string,
    ): Promise<PublicKeyCredentialCreationOptionsJSON | undefined> {
        const session = await auth.getSession();
        if (session === undefined) {
            return undefined;
        }
        const userAccounts = await auth.getUserAccounts<PasskeyMetadata>(
            this.providerName,
            session.userId,
        );
        const options = await generateRegistrationOptions({
            rpID: this.config.rpID,
            rpName: this.config.rpName,
            attestationType: 'none',
            authenticatorSelection: {
                userVerification: 'required',
                residentKey: 'required',
            },
            userID: session.userId,
            userName: username,
            excludeCredentials: userAccounts
                .filter((account) => account.provider === this.providerName)
                .map((account) => ({
                    id: base64urlToBytes(account.key),
                    type: 'public-key',
                })),
        });
        auth.setCookie(this.passkeyChallengeCookieKey(auth), options.challenge);
        return options;
    }

    public async register(
        auth: Guardbox,
        response: RegistrationResponseJSON,
    ): Promise<boolean> {
        const session = await auth.getSession();
        if (session === undefined) {
            return false;
        }
        const challenge = await auth.getCookie(
            this.passkeyChallengeCookieKey(auth),
        );
        await auth.deleteCookie(this.passkeyChallengeCookieKey(auth));
        if (challenge === undefined) {
            return false;
        }
        const { verified, registrationInfo } = await verifyRegistrationResponse(
            {
                response,
                expectedChallenge: challenge,
                expectedRPID: this.config.rpID,
                expectedOrigin: this.config.origin,
            },
        );
        if (!verified || registrationInfo === undefined) {
            return false;
        }
        const metadata: PasskeyMetadata = {
            id: bytesToBase64url(registrationInfo.credentialID),
            pabulickKey: bytesToBase64url(registrationInfo.credentialPublicKey),
            counter: registrationInfo.counter,
            deviceType: registrationInfo.credentialDeviceType,
            backedUp: registrationInfo.credentialBackedUp,
        };
        await auth.addAccount<PasskeyMetadata>({
            userId: session.userId,
            provider: this.providerName,
            key: metadata.id,
            metadata,
        });
        return true;
    }

    public async getAuthenticationOptions(
        auth: Guardbox,
    ): Promise<PublicKeyCredentialRequestOptionsJSON> {
        const options = await generateAuthenticationOptions({
            userVerification: 'preferred',
        });
        auth.setCookie(this.passkeyChallengeCookieKey(auth), options.challenge);
        return options;
    }

    public async authenticate(
        auth: Guardbox,
        response: AuthenticationResponseJSON,
    ): Promise<boolean> {
        const challenge = await auth.getCookie(
            this.passkeyChallengeCookieKey(auth),
        );
        await auth.deleteCookie(this.passkeyChallengeCookieKey(auth));
        if (challenge === undefined) {
            return false;
        }
        const account = await auth.getAccount<PasskeyMetadata>(
            this.providerName,
            response.id,
        );
        if (account === undefined) {
            return false;
        }
        const { verified, authenticationInfo } =
            await verifyAuthenticationResponse({
                response,
                expectedChallenge: challenge,
                expectedRPID: this.config.rpID,
                expectedOrigin: this.config.origin,
                authenticator: {
                    credentialID: base64urlToBytes(account.metadata.id),
                    credentialPublicKey: base64urlToBytes(
                        account.metadata.pabulickKey,
                    ),
                    counter: account.metadata.counter,
                },
            });
        if (!verified) {
            return false;
        }
        await auth.updateAccountMetadata<PasskeyMetadata>(
            this.providerName,
            account.key,
            {
                ...account.metadata,
                counter: authenticationInfo.newCounter,
            },
        );
        const session = await auth.createSession(account.userId);
        await auth.setSession(session);
        return true;
    }
}
