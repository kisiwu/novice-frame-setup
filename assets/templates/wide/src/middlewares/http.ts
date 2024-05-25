import { ErrorRequestHandler, RequestHandler } from 'express'
import Logger from '@novice1/logger'
import routing from '@novice1/routing'

const logger = Logger.debugger('middleware')

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const httpError: ErrorRequestHandler = (err, _req, res, _next) => {
    Logger.error(err)
    return res.status(500).json({message: 'Something went wrong.', label: 'InternalServerError'})
}

export const httpNotFound: RequestHandler = (req, res) => {
    logger.extend('httpNotFound').log(`${req.method} ${req.originalUrl}`)
    return res.status(404).json({message: 'The resource was not found.', label: 'NotFound'})
}

export const validatorOnError: routing.ErrorRequestHandler = (err, req, res) => {
    const { _original, ...details } = err
    logger.extend('validatorOnError').log(`${req.method} ${req.originalUrl} | ${err}`)
    return res.status(400).json({ ...details, message: 'The request was invalid.', label: 'BadRequest' })
}
