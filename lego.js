errors = [
    { code: 1, message: 'shit happens, we\'re sorry' }
]

function wrap(fun) {
    return function (params_obj, sorted_params_list = []) {
        return function (req, response) {
            return new Promise((res, rej) => {
                let arguments_arr = sorted_params_list.map((argument) => {
                    var match = params_obj[argument.key]
                    if (argument.required && !match)
                        throw new Error(`Error, ${argument.key} is required`)
                    return match
                })
                var result = fun(...arguments_arr)
                if (result !== undefined && result.then && result.catch) {
                    result.then(response.send).catch(e => {
                        if (e === undefined) {
                            rej()
                        } else {
                            rej({
                                message: (typeof e === 'object') ? JSON.stringify(e) : e.toString()
                            })
                        }
                    })
                } else {
                    response.send(result)
                }
            }).catch((err) => {
                if (err && err.message) {
                    var message = err.message;
                    try {
                        var { message } = errors.find(error => error.code == JSON.parse(err.message).__ERR_CODE__) || { message }
                    } catch (e) { }
                    try {
                        return response.send(JSON.parse(message))
                    } catch (e) {
                        return response.send({ message })
                    }
                }
                return response.send({ message: 'Error occured' })
            })
        }
    }
}

function squashToObj(...arguments_objs_arr) {

    var obj = {};
    var index = 0;
    var incrementIndex = this.incrementIndex || function () { index++ }
    arguments_objs_arr.forEach(argument => {
        if (argument !== undefined && argument !== null && argument[Symbol.iterator]) {
            argument = squashToObj.call({}, ...argument)
        }
        if (argument !== undefined && argument !== null && typeof argument === 'object') {
            Object.keys(argument).forEach(key => {
                obj[key] = argument[key]
            })
        } else {
            while (obj[index] !== undefined) {
                incrementIndex()
            }
            obj[index] = argument;
            incrementIndex()
        }
    })
    return obj;
}

function responsify(fun, arguments_objs_arr, options) {
    return wrap(fun)(squashToObj(arguments_objs_arr), options)
}

module.exports = {
    responsify,
    squashToObj
}