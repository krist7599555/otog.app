import { match, P } from 'ts-pattern'
import * as t from 'io-ts'
import { pipe } from 'fp-ts/es6/function.js'
import { either } from 'fp-ts/es6/index.js'
import { PathReporter } from 'io-ts/es6/PathReporter.js'
import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import { array, nonEmptyArray, task, taskEither as TE } from 'fp-ts'

const noop = (...args: any[]) => {}

const fp_exec_raw = (command: string, opt: import("bun").SpawnOptions.OptionsObject = {}) => async () => {
  console.info('Bun.spawn:', command)
  const subprocess = Bun.spawn({
    ...opt,
    cmd: command.split(/\s+/g),
    stderr: "pipe",
    stdout: "pipe",
    stdin: "pipe"
  })
  console.log('subprocess.exited', subprocess.exited)
  const exit_code = await subprocess.exited;
  const stdio = { 
    stdout: subprocess.stdout ? (await Bun.readableStreamToText(subprocess.stdout) ?? '').trim(): '',
    stderr: subprocess.stderr ? (await Bun.readableStreamToText(subprocess.stderr) ?? '').trim(): ''
  }
  const res ={ 
    exit_code: exit_code,
    command,
    ...stdio
  }
  if (exit_code === 0) {
    return either.right(res)
  } else {
    return either.left(res)
  }
}
async function exec(command: string, opt: import("bun").SpawnOptions.OptionsObject = {}) {
  console.info('Bun.spawn:', command)
  const subprocess = Bun.spawn({
    ...opt,
    cmd: command.split(/\s+/g),

  })
  console.log('subprocess.exited', subprocess.exited)
  const exit_code = await subprocess.exited;
  const stdio = { 
    stdout: subprocess.stdout ? (await Bun.readableStreamToText(subprocess.stdout) ?? '').trim(): '',
    stderr: subprocess.stderr ? (await Bun.readableStreamToText(subprocess.stderr) ?? '').trim(): ''
  }
  if (exit_code === 0) {
    return { 
      exit_code: exit_code,
      ...stdio
    }
  } else {
    console.error(exit_code, stdio)
    throw new Error(`exit_code is ${exit_code}, from command [${command}], stdout=${stdio.stdout}, stderr=${stdio.stderr}`)
  }
}
const fp_exec = (...args: Parameters<typeof exec> ) => TE.tryCatch(() => exec(...args), either.toError)

const JudgeData = t.type({
  lang: t.literal("cpp"),
  source_code: t.string,
  problem: t.literal("isprime"), // for now
  user: t.string
})
type JudgeData = t.TypeOf<typeof JudgeData>

const JudgeOutput = t.type({
  result: t.string,
  score: t.Integer
})
type JudgeOutput = t.TypeOf<typeof JudgeOutput>

const json = <T>(status: 200 | 400 | 404 | 500, obj: T) => new Response(JSON.stringify(obj), {
  status: status,
  headers: {
    'content-type': "application/json"
  }
})

type JudgeOk = { _tag: 'JudgeOk', result: string, score: number };
type JudgeIsolateError = { _tag: 'JudgeIsolateError', message: string }
type JudgeCompileError = { _tag: 'JudgeCompileError', message: string }
type JudgeUnknowError = { _tag: 'JudgeUnknowError', message: string }
type JudgeFsError = { _tag: 'JudgeFsError', message: string }
type JudgeError = JudgeIsolateError | JudgeCompileError | JudgeUnknowError | JudgeFsError
 
let global_box_id = 0;
const judge = (inp: JudgeData): TE.TaskEither<JudgeError, JudgeOk> => async () => {
  const box_id = ++global_box_id % 1000;
  
  try {
    const isolation_p = await pipe(
      TE.fromIO(() => box_id),
      TE.chain(box =>
        pipe(
          fp_exec(`isolate --init --box-id ${box}`),
          TE.mapLeft((err): JudgeIsolateError => ({ _tag: "JudgeIsolateError", message: `init isolateion error at box-id=${box_id}; ${err.message}` })),
      )),
      TE.map(o => o.stdout)
    )();
    if (either.isLeft(isolation_p)) return isolation_p
    const isolate_path = isolation_p.right;
    const problems_path = path.resolve(import.meta.dir, `./problems/${inp.problem}`);

    const copy_file_to_isolate = await pipe(
      TE.tryCatch(async () => {
        await Bun.write(path.join(isolate_path, 'main.cpp'), inp.source_code)
        await exec(`cp -a . ${isolate_path}`, {
          cwd: problems_path
        })
        return isolate_path
      }, (err): JudgeFsError => ({ _tag: "JudgeFsError", message: `${err}`} ) ),
      TE.chainW(isolate_path => pipe(
        fp_exec_raw(`g++ -std=c++20 -O2 ./main.cpp -o ./box/bin`, { cwd: isolate_path }),
        TE.mapLeft((err): JudgeCompileError => {
          console.debug("JudgeCompileError", err)
          return ({ _tag: 'JudgeCompileError', message: err.stderr })
        }),
        TE.map(() => "./bin" as const)
      )),
    )();
    if (either.isLeft(copy_file_to_isolate)) return copy_file_to_isolate

    const infer_testcase_count = await pipe(
      TE.tryCatch(() => fs.readdir(isolate_path), either.toError),
      TE.mapLeft((err): JudgeFsError => ({ _tag: "JudgeFsError", message: `can not read isolate_path folder. ${err}` })),
      TE.chain((files) => {
        let i = 0;
        while (files.includes(`${i+1}.in`) && files.includes(`${i+1}.sol`)) {
          i += 1;
        }
        return i > 0 ? TE.right(i) : TE.left<JudgeFsError>({ _tag: "JudgeFsError", message: "1.in and 1.sol not exist"})
      })
    )();

    if (either.isLeft(infer_testcase_count)) return infer_testcase_count
    const result = await pipe(
      nonEmptyArray.range(1, infer_testcase_count.right),
      nonEmptyArray.traverse(task.ApplicativeSeq)((i) => pipe(
        fp_exec_raw(`cp ${i}.in ./box/${i}.in`, { cwd: isolate_path }),
        TE.chain(() => 
          fp_exec_raw(`isolate --run --box-id ${box_id} --mem 10024 --time 1.00 --extra-time 0.50 --stdin ${i}.in --stdout ${i}.out --meta ${i}.meta -- ./bin`, { cwd: isolate_path }),
        ),
        TE.mapLeft(err => {
          return "X"
        }),
        TE.fold(
          (err) => 
            TE.tryCatch<"?", "P" | "-" | "X" | "T">(async () => {
              const meta = await Bun.file(path.resolve(isolate_path, `${i}.meta`)).text();
              
              // TODO: read meta
              console.log(meta)
              // time:1.098
              // time-wall:1.098
              // max-rss:2612
              // csw-voluntary:3
              // csw-forced:6
              // status:TO
              // message:Time limit exceeded
              if (meta.includes("status:TO")) return 'T'
              return "X"
            }, err => {
              console.log('l158', err)
              return "?"
            }),
          () =>
            TE.tryCatch<"?", "P" | "-" | "X" | "T">(async () => {
              const meta = await Bun.file(path.resolve(isolate_path, `${i}.meta`)).text();
              console.log(meta)
              const out = (await Bun.file(path.resolve(isolate_path, `box/${i}.out`)).text()).trim().split(/\s+/g);
              const sol = (await Bun.file(path.resolve(isolate_path, `${i}.sol`)).text()).trim().split(/\s+/g);
              console.log({i, out,sol})
              return out.length === sol.length && array.zip(out, sol).every(([a, b]) => a === b) ? "P" : "-"
            }, err => {
              console.log('l170', err)
              return "?"
            })),
        o => o,
        TE.foldW(a => task.fromIO(() => a), b => task.fromIO(() => b)),
        o => o,
      ))
    )();
    // return either.right<JudgeOk>({
    //   _tag: "JudgeOk",
    //   result: "?????",
    //   score: 90,
    // })
    return either.right<JudgeError, JudgeOk>({
      _tag: 'JudgeOk',
      result: result.join(''),
      score: Math.floor(result.reduce((acc, ch) => acc + (ch === 'P' ? 1 : 0), 0) / result.length * 100)
    })
  } catch(err) {
    return either.left<JudgeError, JudgeOk>({
      _tag: 'JudgeUnknowError',
      message: `${err}`
    })
  } finally {
    // await exec(`isolate --cleanup --box-id ${box_id}`).catch(noop)
  }
}

async function isolate_cleanall() {
  const isolate_dir = "/var/local/lib/isolate"
  const folder = await fs.readdir(isolate_dir)
  for (const folder_name of folder) {
    await exec(`isolate --cleanup --box-id ${folder_name}`).catch(noop)
    await exec(`rm -rf ${path.resolve(isolate_dir, folder_name)}`).catch(noop)
  }
}

await isolate_cleanall()
export default {
    // port: 3000, // default = 3000
    async fetch(request: Request) {
      return await match({ method: request.method, pathname: new URL(request.url).pathname })
        .with({ pathname: "/clean" }, async () => {
          const out = await isolate_cleanall()
          return json(200, out)
        })
        .with({ method: "POST", pathname: "/judge" }, async () => {
          console.log(PathReporter)
          return pipe(
            await request.json(),
            o => JudgeData.decode(o),
            either.fold(
              async err => json(400, { message: PathReporter.report(either.left(err)) }),
              async ok => {
                const out = await judge(ok)();
                return pipe(
                  out,
                  either.foldW(
                    err => json(err._tag === "JudgeCompileError" ? 400 : 500, err),
                    data => json(200, { result: data.result, score: data.score }),
                  )
                )
              }
            )
          )
        })
        .otherwise(() => {
          return json(404, { message: "Welcome to Bun!" });
        })
        .catch((err: any) => {
          console.error('line90', err)
          return json(500, { message: `${err}` });
        })
    },
  };
