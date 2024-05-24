import { Frame } from '@novice1/frame'
import Logger from '@novice1/logger'
import { AddressInfo } from 'net'
import { PORT } from './config/app'
import { httpError, httpNotFound, validatorOnError } from './middlewares/http'
import homepage from './routers/homepage'
import tests from './routers/tests'

// init
const frame = new Frame({
    framework: {
        cors: false,
        validatorOnError
    },
    routers: [
        homepage,
        tests
    ]
})

// 404 - 500
frame
    .use(httpNotFound)
    .useError(httpError)

// listen
const server = frame.listen(PORT, () => {
    const addressInfo = server.address() as AddressInfo
    Logger.info('Application listening on port', addressInfo.port);
})
