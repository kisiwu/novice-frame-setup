import {
    OAuth2ClientCredsShape,
    OAuth2ClientCredsTokenRoute,
    OAuth2InvalidRequestResponse,
    OAuth2InvalidTokenResponse,
    OAuth2RefreshTokenRoute,
    OAuth2TokenResponse
} from '@novice1/frame';
import Logger from '@novice1/logger';

const Log = Logger.debugger('oauth2-client-credentials-shape')

const tokenRoute = new OAuth2ClientCredsTokenRoute('/oauth2/cc/token')
    .setHandler(async ({ clientId, clientSecret, scope }, _req, res) => {

        // Here you handle the access token request
        Log.debug('scope', scope)
        Log.debug('clientId', clientId)
        Log.debug('clientSecret', clientSecret)

        try {
            //#region @TODO: validation + token
            const accessToken = 'generated_access_token'
            const refreshToken = 'generated_refresh_token'
            const scope: string[] = []
            return res.json(new OAuth2TokenResponse(accessToken, 'bearer')
                .setExpiresIn(36000)
                .setScope(scope.join(' '))
                .setRefreshToken(refreshToken)
            )
            //#endregion @TODO: validation + token
        } catch (err) {
            Log.error(err)
        }

        return res.status(400).json(new OAuth2InvalidRequestResponse())

    })

const refreshTokenRoute = new OAuth2RefreshTokenRoute('/oauth2/cc/refresh_token')
    .setHandler(async ({ clientId, clientSecret, refreshToken, scope }, _req, res) => {

        Log.debug('clientId', clientId)
        Log.debug('clientSecret', clientSecret)
        Log.debug('refreshToken', refreshToken)
        Log.debug('scope', scope)

        //#region @TODO: validation + refresh token

        //#endregion @TODO: validation + refresh token

        return res.status(400).json(new OAuth2InvalidTokenResponse())
    })

export const clientCredentialsSecurity = new OAuth2ClientCredsShape('OAuth2 Client Credentials', tokenRoute, refreshTokenRoute)
    .setDescription('This API uses OAuth 2 with the client credentials grant flow. [More info](https://oauth.net/2/grant-types/client-credentials/)')
    .setScopes({})
    .setAuthHandlers(
        async (req, res, next) => {
            const authHeaderValue = req.header('authorization')
            if (authHeaderValue && authHeaderValue.startsWith('Bearer ')) {

                // const token = authHeaderValue.substring(7)

                //#region @TODO: validation

                //#endregion @TODO: validation

                // authorized to go further
                return next()
            }
            return res.status(401).json({
                error: 'unauthorized'
            })
        }
    )