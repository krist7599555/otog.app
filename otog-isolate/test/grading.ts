import { $ } from 'https://deno.land/x/zx_deno/mod.mjs'
import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";

type Grading 
  = { type: "CompileError", reason: string }
  | { type: "Graded", short_result: ("P"|"X"|"-"|"T")[], percent: number, pass: boolean }

async function mktemp() {
  const { stdout: _tmp_file } = await $`mktemp`
  return _tmp_file.trim()
}
async function rm(path: string) {
  await $`rm ${path}`
}
function range(start: number, end: number) {
  return Array.from({ length: (end - start) }).map((_, i) => start + i)
}

function find_arg(name: `--${string}`) {
  const idx = Deno.args.findIndex(arg => arg === name)
  if (idx === -1) throw new Error(`expect argument ${name}`)
  return Deno.args[idx + 1] ?? '';
}

async function basic_grading(opt: { lang: "cpp", source_code: string, testcase_count: number, testcase_folder: string, timeout: number }): Promise<Grading> {
  let local_source_code: string | null = null
  let local_binary: string | null = null

  try {
    local_source_code = await mktemp();
    await Deno.writeTextFile(local_source_code, opt.source_code)

    local_binary = await mktemp();
    const compile_output = await $`g++ -std=c++20 ${find_arg("--source-code-path")} -o ${local_binary}`

    if (compile_output.exitCode !== 0) {
      return {
        type: "CompileError",
        reason: compile_output.stderr
      }
    }

    const result = await  Promise.all(range(1, opt.testcase_count + 1).map(async (i) => {
      const user_answer = await $`${local_binary} < ${path.join(opt.testcase_folder, `${i}.in`)}`;
      if (user_answer.exitCode !== 0) {
        return {
          score: "X" as const,
          reason: user_answer.stderr
        } as const
      }
      const solution = await Deno.readTextFile(path.join(opt.testcase_folder, `${i}.sol`))

      const sol = solution.trim().split(/\s+/)
      const ans = user_answer.stdout.trim().split(/\s+/)
      if (ans.length === sol.length || sol.every((_, i) => sol[i] === ans[i])) return { score: "P"  } as const
      return { score: "-" }  as const
    }))

    const short_result = result.map(o => o.score) 
    const right_answer_count = short_result.reduce((acc,ch) => acc + (ch === "P" ? 1 : 0), 0);
    return {
      type: "Graded",
      short_result,
      percent: Math.round(right_answer_count / short_result.length),
      pass: right_answer_count === short_result.length
    }
  } catch(err) {
    return { type: "CompileError", reason: `Unknow Internal Error ${err}` }
  } finally {
    if (local_source_code) {
      await rm(local_source_code).catch(() => { console.error("error rm file")})
    }
    if (local_binary) {
      await rm(local_binary).catch(() => { console.error("error rm file")})
    }
  }
}

await basic_grading({
  lang: "cpp",
  source_code: 'int main() {}',
  timeout: 1000,
  testcase_count: 5,
  testcase_folder: await Deno.realPath('./testcases')
})


