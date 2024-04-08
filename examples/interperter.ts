import { apiKey } from '../config';
import { Interpreter } from '../src/interperter';
import { QwenClient } from '../src/qwen';
async function main() {
  const qwenClient = new QwenClient({
    apiKey,
  });
  const interpreter = new Interpreter(qwenClient);
  await interpreter.execute('www.baidu.com 网页中的标题');
}

main();
