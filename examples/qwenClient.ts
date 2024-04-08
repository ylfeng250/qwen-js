import { QwenClient } from '../src/qwen';
import { getResponseString } from '../src/utils';
import { promptTemplate } from '../src/promptTemplate';
import { parseCodeBlockToList } from '../src/parseCodeBlockToList';
import { apiKey } from '../config';

async function main() {
  const qwenClient = new QwenClient({ apiKey });
  const prompt = promptTemplate.replace('{GOAL}', '写一个获取网页html的代码');
  const res = await qwenClient.chat(prompt);
  const content = getResponseString(res);
  console.log(parseCodeBlockToList(content));
}

main();
