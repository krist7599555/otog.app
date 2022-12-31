import * as fs from 'fs/promises'
import * as path from 'path'

const buff = await fs.readFile(path.resolve(import.meta.dir, "./isprime.cpp"))
console.log(buff.toString("utf-8"))
const a = await fetch(new Request("http://0.0.0.0:3000/judge", {
    method: "POST",
    body: JSON.stringify({
        lang: "cpp",
        source_code: buff.toString("utf-8"),
        problem: "isprime",
        user: "krist7599555"
    }),
    headers: {
        'content-type': "application/json"
    }
}))
console.log({
    status: a.status,
    header:Array.from( a.headers.entries()),
    resp: await a.json()
})