var { responsify, squashToObj } = require('./lego')

describe('squashToObj', () => {
    var req;

    it('should return the same object given one obj', () => {
        var req;
        var obj = { e: 2, r: "ahmed" }
        expect(squashToObj(obj)).toEqual({ e: 2, r: "ahmed" })
    })

    it("should assign keys for primitive values", () => {
        expect(squashToObj(3, 4)).toEqual({ "0": 3, "1": 4 })
    })

    it("shouldn't fail when no arguments passesed", () => {
        expect(squashToObj()).toEqual({})
    })

    it.skip("shouldn't fail when no null or req passesed", () => {
        expect(squashToObj(null, [req])).toEqual({ 0: null, 1: req })
    })

    it('should squash list of objects into one object', () => {
        var req;
        var obj1 = { _id: 2, name: "ahmed" }

        var obj2 = { x: 2, y: 3 }
        expect(squashToObj(obj1, obj2)).toEqual(
            { "_id": 2, "name": "ahmed", "x": 2, "y": 3 }
        )
    })

    it('should squash array of objects into one object', () => {
        var req;
        var arr = [{ x: 2, y: 3 }, { _id: 2, name: "ahmed" }]
        expect(squashToObj(arr)).toEqual({ "_id": 2, "name": "ahmed", "x": 2, "y": 3 })
    })

    it.skip('should recurse if given list of array of objects', () => {
        var req;
        var arr1 = [{ x: 2 }, { 1: 2, 2: 3 }];
        var arr2 = [{ s: 2 }];
        var obj1 = { y: 5, _id: 2 };
        var arr3 = [5, 6]
        expect(squashToObj(arr1, arr2, obj1, arr3)).toEqual({ "1": 2, "2": 3, "_id": 2, "s": 2, "x": 2, "y": 5, "0": 5, "3": 6 })
    })
})


describe('responsify', () => {
    var req;

    it('returning "Error occured" if exception occured and no code or message found', () => {
        var req;
        var fun = () => {
            throw new Error()
        }
        var res = {
            send: (response) => {
                expect(response).toEqual({ "message": "Error occured" })
            }
        }
        responsify(fun)(req, res)
    })

    it('returning "Error occured" if rejection occured and no code or message found', () => {
        var req;
        var fun = () => {
            return Promise.reject()
        }
        var res = {
            send: (response) => {
                expect(response).toEqual({ "message": "Error occured" })
            }
        }
        responsify(fun)(req, res)
    })

    it('returning ${custom error message} if exception occured and no code found', () => {
        var req;
        var fun = () => {
            throw new Error("custom message lol xDD")
        }
        var res = {
            send: (response) => {
                expect(response).toEqual({ "message": "custom message lol xDD" })
            }
        }
        responsify(fun)(req, res)
    })

    it('returning ${custom error message} if rejection occured and no code found (Example 1)', () => {
        var req;
        var fun = () => {
            return Promise.reject("custom message lol2 xDD")
        }
        var res = {
            send: (response) => {
                expect(response).toEqual({ "message": "custom message lol2 xDD" })
            }
        }
        responsify(fun)(req, res)
    })

    it('it looks up for error code if exception occured and code found', () => {
        var req;
        var fun = () => {
            throw new Error(JSON.stringify({ __ERR_CODE__: 1 }))
        }
        var res = {
            send: (response) => {
                expect(response).toEqual({ "message": "shit happens, we're sorry" })
            }
        }
        responsify(fun)(req, res)
    })

    it('it looks up for error code if rejection occured and code found', () => {
        var req;
        var fun = () => {
            return Promise.reject({ __ERR_CODE__: 1 })
        }
        var res = {
            send: (response) => {
                expect(response).toEqual({ "message": "shit happens, we're sorry" })
            }
        }
        responsify(fun)(req, res)
    })

    it('it passes the result of sync functions (Example 1)', () => {
        var req;
        var fun = () => {
            return 5
        }
        var res = {
            send: (response) => {
                expect(response).toEqual(5)
            }
        }
        responsify(fun)(req, res)
    })

    it('it passes the result of sync functions  (Example 2)', () => {
        var req;
        var fun = () => {
            return {
                key1: [2, 3],
                key2: { 1: 1, 2: 2 }
            }
        }
        var res = {
            send: (response) => {
                expect(response).toEqual({ "key1": [2, 3], "key2": { "1": 1, "2": 2 } })
            }
        }
        responsify(fun)(req, res)
    })

    it('it passes the result of sync functions  (Example 3)', () => {
        var req;
        var fun = (arg1, arg2) => {
            return arg1 * arg2
        }
        var res = {
            send: (response) => {
                expect(response).toEqual(15)
            }
        }
        responsify(fun, [3, 5], [{ key: 0 }, { key: 1 }])(req, res)
    })

    it('it passes the result of async functions (Example 1)', () => {
        var req;
        var fun = () => {
            return Promise.resolve(5)
        }
        var res = {
            send: (response) => {
                expect(response).toEqual(5)
            }
        }
        responsify(fun)(req, res)
    })

    it('it passes the result of async functions  (Example 2)', () => {
        var req;
        var fun = () => {
            return Promise.resolve({
                key1: [2, 3],
                key2: { 1: 1, 2: 2 }
            })
        }
        var res = {
            send: (response) => {
                expect(response).toEqual({ "key1": [2, 3], "key2": { "1": 1, "2": 2 } })
            }
        }
        responsify(fun)(req, res)
    })

    it('it passes the result of async functions  (Example 3)', () => {
        var req;
        var fun = (arg1, arg2) => {
            return Promise.resolve(arg1 * arg2)
        }
        var res = {
            send: (response) => {
                expect(response).toEqual(15)
            }
        }
        responsify(fun, [3, 5], [{ key: 0 }, { key: 1 }])(req, res)
    })
})
