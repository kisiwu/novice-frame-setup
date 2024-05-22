import { ErrorRequestHandler, RequestHandler } from 'express'
import Logger from '@novice1/logger'
import routing from '@novice1/routing'

const logger = Logger.debugger('middleware')

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const httpError: ErrorRequestHandler = (err, _req, res, _next) => {
    logger
        .extend('httpError')
        .error(err);
    return res.status(500).json({message: 'Something went wrong', code: 'internalServerError'})
}

export const httpNotFound: RequestHandler = (_, res) => {
    return res.status(404).json({message: 'Not found', code: 'notFound'})
}

export const validatorOnError: routing.ErrorRequestHandler = (err, _req, res) => {
    const { _original, ...details } = err
    return res.status(400).json({ ...details, code: 'badRequest' })
}