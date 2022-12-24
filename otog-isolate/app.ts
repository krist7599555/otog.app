import polka from 'polka';
import bodyparser from 'body-parser';
import send from '@polka/send-type';
import { basic_grading } from './grading';
import * as path from 'node:path';
const { PORT = 3000 } = process.env;

const app = polka();

app
  .use(bodyparser.json())
  .get('/', async (req, res) => {
    send(res, 200, {
      router: ['POST /cpp']
    });
  })
  .get('/cpp', (req, res) => {
    return send(res, 200, {
      lang: 'cpp'
    });
  })
  .post('/test', async (req, res) => {
    console.log('req.body', req.body);
    const out = await basic_grading({
      lang: 'cpp',
      source_code: req.body?.source_code,
      testcase_count: 5,
      testcase_folder: path.resolve('./test/testcases'),
      timeout: 1000
    })();
    console.log({ '/test': out });
    return send(res, 200, out);
  })
  .post('/cpp', (req, res) => {
    return send(res, 200, {
      lang: 'cpp'
    });
  })
  .listen(+PORT, () => {
    console.log(`> Running on localhost:${PORT}`);
  });
