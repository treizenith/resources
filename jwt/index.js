const jwt = require('jsonwebtoken');
const keys = require("./keys.json");
const user = {
    username: "ASD123",
    email: "asd@asd",
    password: "asdasd123",
    credit: 15,
    banned: false,
    admin: true,
}
const token = jwt.sign(user, keys.siteKey);
console.log(token);

const jwtdata = jwt.verify(token, keys.siteKey);
console.log(jwtdata);

// Require the framework and instantiate it
const fastify = require('fastify')({
    logger: true
})

fastify.register(require('fastify-static'), {
    root: __dirname + "/public/",
    prefix: '/', // optional: default '/'
  })

// Declare a route
fastify.get('/api', function (request, reply) {
    reply.send({
        hello: 'world'
    })
})

fastify.route({
    method: 'PUT',
    url: '/login',
    schema: {
        body: {
            username: {
                type: 'string'
            },
            password: {
                type: 'string'
            }
        },
    },
    preValidation: (req, res, done) => {
        // Some code
        if (req.body.username == "deneme" && req.body.password == "deneme123") return done();
        else res.send({
            error: "Hatalı kullanıcı adı veya şifre!"
        })
    },
    handler: function (req, res) {
        const token = jwt.sign({
            username: req.body.username,
            password: req.body.password
        }, keys.siteKey, {
            expiresIn: "60 s"
        });
        res.header("Authorization", token).send({
            done: true
        })

    }
})

fastify.route({
    method: 'PUT',
    url: '/verify',
    handler: function (req, res) {
        console.log(req.headers);
        if ( !req.headers.authorization ) res.code(403).send({
            error: "JWT_NOT_SEND",
            msg: "JWT bulunamadı!"
        });
        var jwtData;
        try {
            jwtData = jwt.verify(req.headers.authorization, keys.siteKey);
        } catch(e) {
            res.code(403).send(e);
        }
        res.send(jwtData);
    }
})

// Run the server!
fastify.listen(3000, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    fastify.log.info(`server listening on ${address}`)
})