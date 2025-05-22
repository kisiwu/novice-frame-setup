import {
    OAuth2ACAuthorizationRoute,
    OAuth2ACShape,
    OAuth2ACTokenRoute,
    OAuth2InvalidClientResponse,
    OAuth2InvalidRequestResponse,
    OAuth2InvalidTokenResponse,
    OAuth2RefreshTokenRoute,
    OAuth2TokenResponse
} from '@novice1/frame';
import Logger from '@novice1/logger';

const Log = Logger.debugger('oauth2-auth-code-shape')

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

const authenticationRoute = new OAuth2ACAuthorizationRoute('/oauth2/ac/login')
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

const tokenRoute = new OAuth2ACTokenRoute('/oauth2/ac/token')
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

const refreshTokenRoute = new OAuth2RefreshTokenRoute('/oauth2/ac/token')
    // use "setUnsafeHandler" if "clientSecret" is not required on token refresh
    .setHandler(async ({ clientId, clientSecret, refreshToken, scope }, _req, res) => {

        Log.debug('clientId', clientId)
        Log.debug('clientSecret', clientSecret)
        Log.debug('refreshToken', refreshToken)
        Log.debug('scope', scope)

        //#region @TODO: validation + refresh token

        //#endregion @TODO: validation + refresh token

        return res.status(400).json(new OAuth2InvalidTokenResponse())
    })

export const authenticationCodeSecurity = new OAuth2ACShape('OAuth2 Authorization Code', authenticationRoute, tokenRoute, refreshTokenRoute)
    .setDescription('This API uses OAuth 2 with the authentication code grant flow. [More info](https://oauth.net/2/grant-types/authorization-code/)')
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
