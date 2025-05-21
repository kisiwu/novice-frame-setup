import fs from 'node:fs'
import path from 'node:path'
import logger from '@novice1/logger'
import * as prompts from '@clack/prompts'
import colors from 'picocolors'

const debug = logger.debugger('nfs:cmd:create-security-shape')

export const TEMPLATES_NAMES = [
    'authorization-code', 'client-credentials', 'password'
]

const TEMPLATES = [
    {
        name: 'authorization-code',
        display: 'OAuth2 Authorization Code Flow',
        color: colors.green,
    },
    {
        name: 'client-credentials',
        display: 'OAuth2 Client Credentials Flow',
        color: colors.yellow,
    },
    {
        name: 'password',
        display: 'OAuth2 Password Flow',
        color: colors.red,
    }
]

/**
 *
 * @param {import('commander').Command} program
 * @returns {(this: import('commander').Command, ...args: any[]) => void | Promise<void>} action
 */
export default function createSecurityShapeCmd(program) {
    return async function action() {
        const opts = this.opts();
        const cwd = process.cwd();
        const cancel = () => prompts.cancel('Operation cancelled')

        // --debug
        if (program.opts().debug) {
            logger.Debug.enable('nfs:*');
        }

        // 1. Project dir
        let targetDir = cwd
        let pckgInfo = path.join(targetDir, 'package.json')

        // 2. Handle current directory
        if (!fs.existsSync(targetDir) || !fs.existsSync(pckgInfo)) {
            prompts.log.error(`Could not find "${pckgInfo}"\n\nYou could create a new project with:\n\n     npx create-novice-frame@latest\n`)
            return cancel()
        }

        const { default: pckg } = await import(`file://${pckgInfo}`, { with: { type: 'json' } })
        if (!pckg?.dependencies?.['@novice1/frame']) {
            prompts.log.error(`Could not find "@novice1/frame" dependency in "${pckgInfo}"`)
            return cancel()
        }

        // 3. Choose a template
        let template = opts.template
        let hasInvalidArgTemplate = false

        if (opts.template && !TEMPLATES_NAMES.includes(opts.template)) {
            template = undefined
            hasInvalidArgTemplate = true
        }

        if (!template) {
            const templateObj = await prompts.select({
                message: hasInvalidArgTemplate
                    ? `"${opts.template}" isn't a valid template. Please choose from below: `
                    : 'Select a template:',
                options: TEMPLATES.map((t) => {
                    const templateColor = t.color
                    return {
                        label: templateColor(t.display || t.name),
                        value: t,
                    }
                }),
            })
            if (prompts.isCancel(templateObj)) return cancel()

            template = templateObj.name
        }

        debug('template =', template)

        // 4. Install
        // @TODO
    }
}