import { $, ProcessPromise, type ProcessOutput } from 'zx';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import {
  task as T,
  option as O,
  taskEither as TE,
  either as E,
  string,
  apply,
  array,
  nonEmptyArray,
  identity,
  io,
  boolean
} from 'fp-ts';
import { flow, pipe } from 'fp-ts/lib/function.js';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter.js';

type Grading =
  | { type: 'CompileError'; reason: string }
  | { type: 'Graded'; short_result: ('P' | 'X' | '-' | 'T')[]; percent: number; pass: boolean };

interface AbsolutePathBrand {
  readonly AbsolutePath: unique symbol;
}
const AbsolutePath = t.brand(
  t.string,
  (s): s is t.Branded<string, AbsolutePathBrand> => path.isAbsolute(s),
  'AbsolutePath'
);
type AbsolutePath = t.TypeOf<typeof AbsolutePath>;
const io_report_errors = (errs: t.Errors) =>
  new Error(PathReporter.report(t.failures(errs)).join('\n'));
const parse_absolute_path = (path: string) =>
  pipe(AbsolutePath.decode(path), E.mapLeft(io_report_errors));

class CompileError extends Error {
  constructor(message: string, public lang: string, public version: string) {
    super(message);
  }
}

const zx_normal_exitcode = (out: ProcessOutput) =>
  pipe(
    out,
    E.fromPredicate(
      (o): o is ProcessOutput & { exitCode: 0 } => o.exitCode === 0,
      () => new Error('exit code is not 0')
    )
  );
const zx_normal_exitcode_2 = (out: ProcessOutput) =>
  pipe(
    out,
    E.fromPredicate(
      (o): o is ProcessOutput & { exitCode: 0 } => o.exitCode === 0,
      (o): ProcessOutput & { exitCode: Exclude<number, 0> } => o as any
    )
  );

const zx_exec = (ps: io.IO<ProcessPromise>) =>
  pipe(TE.tryCatch(ps, E.toError), TE.chainEitherK(zx_normal_exitcode));

const mktemp: TE.TaskEither<Error, AbsolutePath> = pipe(
  TE.tryCatch(() => $`mktemp`, E.toError),
  TE.chainEitherK(zx_normal_exitcode),
  TE.chainEitherK(
    flow(({ stdout }) => stdout, string.trim, AbsolutePath.decode, E.mapLeft(io_report_errors))
  )
);
const mktemp_dir: TE.TaskEither<Error, AbsolutePath> = pipe(
  TE.tryCatch(() => $`mktemp -d`, E.toError),
  TE.chainEitherK(zx_normal_exitcode),
  TE.chainEitherK(
    flow(({ stdout }) => stdout, string.trim, AbsolutePath.decode, E.mapLeft(io_report_errors))
  )
);

const rm = (path: AbsolutePath) =>
  pipe(
    zx_exec(() => $`rm ${path}`),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    TE.map((): void => {})
  );

const rm_rf = (path: AbsolutePath) =>
  pipe(
    zx_exec(() => $`rm -rf ${path}`),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    TE.map((): void => {})
  );

const fp_write_file = (path: AbsolutePath) => (data: Uint8Array) =>
  pipe(
    TE.tryCatch(() => fs.writeFile(path, data), E.toError),
    TE.map(() => path)
  );
const fp_read_file = (path: AbsolutePath) => pipe(TE.tryCatch(() => fs.readFile(path), E.toError));

const string_tokenize = (s: string): string[] =>
  pipe(s, string.trim, string.replace(/\s+/g, ' '), string.split(' '), s => [...s]);

export const basic_grading = (opt: {
  lang: 'cpp';
  source_code: string;
  testcase_count: number;
  testcase_folder: string;
  timeout: number;
}) =>
  pipe(
    TE.Do,
    TE.bind('tmp_dir', () => mktemp_dir),
    TE.bind('tmp_app_cpp', ({ tmp_dir }) =>
      pipe(
        path.join(tmp_dir, 'app.cpp'),
        parse_absolute_path,
        TE.fromEither,
        TE.map(fp_write_file),
        TE.chain(identity.ap(Buffer.from(opt.source_code)))
      )
    ),
    TE.bind('tmp_app_bin', ({ tmp_dir, tmp_app_cpp }) =>
      pipe(
        TE.Do,
        TE.apS('bin', pipe(path.join(tmp_dir, 'app.bin'), parse_absolute_path, TE.fromEither)),
        TE.bind('compile', ({ bin }) =>
          pipe(
            TE.tryCatch(() => $`g++ -std=c++20 ${tmp_app_cpp} -o ${bin}`, E.toError),
            TE.chainEitherKW(
              flow(
                zx_normal_exitcode_2,
                E.mapLeft(ps_out => new CompileError(ps_out.stderr, 'g++', '-std=c++20'))
              )
            ),
            o => o
          )
        ),
        TE.map(o => o.bin),
        o => o
      )
    ),
    TE.bind('result', ({ tmp_app_bin }) => {
      return pipe(
        nonEmptyArray.range(1, opt.testcase_count),
        array.traverse(TE.ApplicativePar)(i =>
          pipe(
            TE.Do,
            TE.apS(
              'in_path',
              TE.fromEither(parse_absolute_path(path.join(opt.testcase_folder, `${i}.in`)))
            ),
            TE.apS(
              'sol_path',
              TE.fromEither(parse_absolute_path(path.join(opt.testcase_folder, `${i}.sol`)))
            ),
            TE.bind('res', ({ in_path, sol_path }) =>
              pipe(
                zx_exec(() => $`${tmp_app_bin} < ${in_path}`),
                TE.chainEitherKW(
                  flow(
                    zx_normal_exitcode_2,
                    E.mapLeft(err => ({ result: 'X' as const, reason: err.stderr }))
                  )
                ),
                TE.chainW(o =>
                  pipe(
                    fp_read_file(sol_path),
                    TE.map(buf => buf.toString('utf-8')),
                    TE.map(string_tokenize),
                    TE.map(sol_tokens =>
                      pipe(
                        array.zipWith(sol_tokens, string_tokenize(o.stdout), string.Eq.equals),
                        array.every(Boolean),
                        is_all_equal =>
                          is_all_equal ? ({ result: 'P' } as const) : ({ result: '-' } as const)
                      )
                    )
                  )
                ),
                TE.matchW(
                  s => s,
                  s => s
                ),
                T.map(o => (o instanceof Error ? E.left(o) : E.right(o)))
              )
            ),
            TE.map(res => res.res.result),
            o => o
          )
        ),
        o => o
      );
    }),
    TE.chain(o =>
      pipe(
        rm_rf(o.tmp_dir),
        TE.map(() => o)
      )
    ),
    TE.map(({ result }) => {
      const count_P = result.reduce((acc, ch) => acc + (ch === 'P' ? 1 : 0), 0);
      return {
        result_short: result,
        percent: Math.round(count_P / result.length),
        pass: count_P === result.length
      };
    }),
    o => o
  );
//   let tmp_app_cpp: string | null = null;
//   let tmp_app_bin: string | null = null;

//   try {
//     tmp_app_cpp = await mktemp();
//     await Deno.writeTextFile(tmp_app_cpp, opt.source_code);

//     tmp_app_bin = await mktemp();
//     const compile_output = await $`g++ -std=c++20 ${find_arg(
//       '--source-code-path'
//     )} -o ${tmp_app_bin}`;

//     if (compile_output.exitCode !== 0) {
//       return {
//         type: 'CompileError',
//         reason: compile_output.stderr
//       };
//     }

//     const result = await Promise.all(
//       range(1, opt.testcase_count + 1).map(async i => {
//         const user_answer = await $`${tmp_app_bin} < ${path.join(opt.testcase_folder, `${i}.in`)}`;
//         if (user_answer.exitCode !== 0) {
//           return {
//             score: 'X' as const,
//             reason: user_answer.stderr
//           } as const;
//         }
//         const solution = await Deno.readTextFile(path.join(opt.testcase_folder, `${i}.sol`));

//         const sol = solution.trim().split(/\s+/);
//         const ans = user_answer.stdout.trim().split(/\s+/);
//         if (ans.length === sol.length || sol.every((_, i) => sol[i] === ans[i]))
//           return { score: 'P' } as const;
//         return { score: '-' } as const;
//       })
//     );

//     const short_result = result.map(o => o.score);
//     const right_answer_count = short_result.reduce((acc, ch) => acc + (ch === 'P' ? 1 : 0), 0);
//     return {
//       type: 'Graded',
//       short_result,
//       percent: Math.round(right_answer_count / short_result.length),
//       pass: right_answer_count === short_result.length
//     };
//   } catch (err) {
//     return { type: 'CompileError', reason: `Unknow Internal Error ${err}` };
//   } finally {
//     if (tmp_app_cpp) {
//       await rm(tmp_app_cpp).catch(() => {
//         console.error('error rm file');
//       });
//     }
//     if (tmp_app_bin) {
//       await rm(tmp_app_bin).catch(() => {
//         console.error('error rm file');
//       });
//     }
//   }
// }

// await basic_grading({
//   lang: 'cpp',
//   source_code: 'int main() {}',
//   timeout: 1000,
//   testcase_count: 5,
//   testcase_folder: await Deno.realPath('./testcases')
// });
