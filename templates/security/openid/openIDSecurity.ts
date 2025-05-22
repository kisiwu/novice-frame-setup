import {
    OAuth2Util,
    OAuth2ACAuthorizationRoute,
    OAuth2ACShape,
    OAuth2ACTokenRoute,
    OAuth2InvalidClientResponse,
    OAuth2InvalidRequestResponse,
    OAuth2InvalidTokenResponse,
    OAuth2RefreshTokenRoute,
    OAuth2TokenResponse,
    controller
} from '@novice1/frame';
import routing from '@novice1/routing';
import { SecuritySchemeObject } from '@novice1/api-doc-generator/lib/generators/openapi/definitions';
import Logger from '@novice1/logger';
import { HOST, PORT } from '../../../../config/app';

const Log = Logger.debugger('openid-shape')

const issuer = HOST || `http://localhost:${PORT}`
const authorizationEndpoint = '/openid/login'
const tokenEndpoint = '/openid/token'
const userInfoEndpoint = '/openid/profile'
const jwksEndpoint = '/openid/jwks'
const openidConfigEndpoint = '/.well-known/openid-configuration'
const scopesSupported: string[] = []

class OpenIdAuthUtil extends OAuth2Util {
    toOpenAPI(): Record<string, SecuritySchemeObject> {
        return {
            [this.securitySchemeName]: {
                type: 'openIdConnect',
                openIdConnectUrl: `${issuer}${openidConfigEndpoint}`
            }
        }
    }
}

function buildSignInHTML(options: { title: string, error?: string }) {
    return `<!DOCTYPE html>
<html lang="en">
 <head>
  <meta charset="UTF-8">
  <meta name="Generator" content="EditPlus®">
  <meta name="Author" content="">
  <meta name="Keywords" content="">
  <meta name="Description" content="">
  <title>${options.title}</title>
  <style>
    .error {
      color: red;
      font-weight: bold;
    }
  </style>
 </head>
 <body>
  <form method="POST">
  <div class="error">
    ${options.error || ''}
  </div>
  <div>
  <input type="email" id="email" name="email" placeholder="email" autocomplete="email" />
  <input type="password" id="password" name="password" placeholder="password" />
  </div>
  <div>
  <button type="submit">
    Submit
  </button>
  </div>
  </form>
 </body>
</html>`
}

const authenticationRoute = new OAuth2ACAuthorizationRoute(authorizationEndpoint)
    .setHandler(async ({ clientId, codeChallenge, redirectUri, scope, state }, { query: { nonce } }, res) => {

        Log.debug('clientId', clientId)
        Log.debug('codeChallenge', codeChallenge)
        Log.debug('redirectUri', redirectUri)
        Log.debug('scope', scope)
        Log.debug('state', state)
        Log.debug('nonce', nonce)

        if (clientId) {
            //#region @TODO: validation

            //#endregion @TODO: validation
        } else {
            return res.status(400).json(new OAuth2InvalidClientResponse('Bad \'client_id\' parameter.'))
        }

        // render form
        return res.status(200).contentType('html').send(
            buildSignInHTML({
                title: 'Sign in'
            })
        )
    })
    .setPostHandler(async ({ clientId, codeChallenge, redirectUri, scope, state }, { query: { nonce }, body: { email, password } }: { query: { nonce?: string }, body: { email?: string, password?: string } }, res) => {

        Log.debug('clientId', clientId)
        Log.debug('codeChallenge', codeChallenge)
        Log.debug('redirectUri', redirectUri)
        Log.debug('scope', scope)
        Log.debug('state', state)
        Log.debug('nonce', nonce)

        let error = ''

        if (clientId && email && password) {

            //#region @TODO: validation + code
            const code = 'generated_code'
            if (email == 'user@novice1' && password == '1234') {
                return res.redirect(`${redirectUri}?code=${code}${state ? `&state=${state}` : ''}`)
            } else {
                error = 'wrong credentials'
            }
            //#endregion @TODO: validation + code generation

        } else {
            error = 'invalid request'
        }

        return res.status(400).contentType('html').send(
            buildSignInHTML({
                title: 'Sign in',
                error: error || 'something went wrong'
            })
        )
    })

const tokenRoute = new OAuth2ACTokenRoute(tokenEndpoint)
    .setHandler(async ({ clientId, clientSecret, code, codeVerifier, redirectUri }, _req, res) => {

        Log.debug('code', code)
        Log.debug('codeVerifier', codeVerifier)
        Log.debug('redirectUri', redirectUri)
        Log.debug('clientId', clientId)
        Log.debug('clientSecret', clientSecret)

        if (!clientSecret && !codeVerifier) {
            return res.status(400).json(new OAuth2InvalidClientResponse('Request was missing the \'client_secret\' parameter.'))
        }
        try {
            //#region @TODO: validation + token
            const accessToken = 'generated_access_token'
            const refreshToken = 'generated_refresh_token'
            const idToken = 'generated_id_token'
            const scope: string[] = []
            return res.json({
                ...(new OAuth2TokenResponse(accessToken, 'bearer')
                    .setExpiresIn(36000)
                    .setScope(scope.join(' '))
                    .setRefreshToken(refreshToken)
                    .toJSON()
                ),
                id_token: idToken
            })
            //#endregion @TODO: validation + token
        } catch (err) {
            Log.error(err)
        }

        return res.status(400).json(new OAuth2InvalidRequestResponse())
    })

const refreshTokenRoute = new OAuth2RefreshTokenRoute(tokenEndpoint)
    // use "setHandler" if "clientSecret" is required on token refresh
    .setUnsafeHandler(async ({ clientId, clientSecret, refreshToken, scope }, _req, res) => {

        Log.debug('clientId', clientId)
        Log.debug('clientSecret', clientSecret)
        Log.debug('refreshToken', refreshToken)
        Log.debug('scope', scope)

        //#region @TODO: validation + refresh token

        //#endregion @TODO: validation + refresh token

        return res.status(400).json(new OAuth2InvalidTokenResponse())
    })

export class OpenIDShape extends OAuth2ACShape {

    router(): routing.IRouter {
        return routing()
            .get({
                path: `${openidConfigEndpoint}`,
                parameters: {
                    undoc: true
                }
            }, controller(async () => ({
                issuer,
                authorization_endpoint: `${issuer}${authorizationEndpoint}`,
                token_endpoint: `${issuer}${tokenEndpoint}`,
                userinfo_endpoint: `${issuer}${userInfoEndpoint}`,
                jwks_uri: `${issuer}${jwksEndpoint}`,
                claims_supported: [
                    'aud',
                    'exp',
                    'iat',
                    'iss',
                    'sub'
                ],
                grant_types_supported: [
                    'authorization_code'
                ],
                response_types_supported: [
                    'code',
                    'token',
                    'code token',
                    'code token id_token',
                ],
                scopes_supported: scopesSupported,
                subject_types_supported: [
                    'public'
                ],
                id_token_signing_alg_values_supported: [
                    'RS256'
                ],
                code_challenge_methods_supported: [
                    'S256'
                ],
                token_endpoint_auth_methods_supported: [
                    'client_secret_post',
                ]
            })))
            .get({
                path: `${jwksEndpoint}`,
                parameters: {
                    undoc: true
                }
            }, controller(async () => ({
                keys: [] // RS256 public keys
            })))
            .use(super.router())
    }

    /**
     * @returns BaseAuthUtil ([@novice1/api-doc-generator](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_auth_basicAuthUtil.BasicAuthUtil.html))
     */
    scheme(): OpenIdAuthUtil {
        return new OpenIdAuthUtil(this.securitySchemeName)
    }
}

export const openIDSecurity = new OpenIDShape('OpenID', authenticationRoute, tokenRoute, refreshTokenRoute)
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
