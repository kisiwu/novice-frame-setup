import routing from '@novice1/routing'

const router = routing()

router.get({
    path: '/greetings',
    name: 'Greetings',
    description: 'A short greeting.',
    tags: ['Tests']
}, (_, res) => {
    return res.send('Hello world!')
})

export default routing().use('/tests', router)
