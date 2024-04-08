import { QwenClient } from './qwen';
import { CodeBlock } from './types';
import { getResponseString } from './utils';
import { parseCodeBlockToList } from './parseCodeBlockToList';
import { errorPromptTemplate, promptTemplate } from './promptTemplate';
import { runShell } from './runShell';
import { runNodeCode } from './runNodeCode';

export class Interpreter {
  qwenClient: QwenClient;
  retryCount = 0;
  maxRetry = 3;
  constructor(qwenClient: QwenClient, options = { maxRetry: 3 }) {
    this.qwenClient = qwenClient;
    this.maxRetry = options.maxRetry;
    this.retryCount = 0;
  }

  handleError(error: any) {
    let message = error.stack ? error.stack : error;
    message = message.slice(0, 512);

    console.log('======= Error =======');
    console.log(message);

    if (this.retryCount > this.maxRetry) {
      throw new Error(message);
    }

    this.retryCount++;
    this.tryFixLlmCall('ERROR: ' + message);
  }

  async execute(input: string, isInitial = true) {
    try {
      const prompt = isInitial
        ? promptTemplate.replace('{GOAL}', input)
        : input;
      this.qwenClient.addSystemMessage(prompt);
      const res = await this.qwenClient.chat('现在请告诉我如何实现目标！');
      const content = getResponseString(res);
      const parsed = await this.parseResult(content);
      await this.proceedResult(parsed);
    } catch (e) {
      this.handleError(e);
    }
  }

  async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async proceedResult(parsed: CodeBlock[] = []) {
    try {
      let isDone = false;
      for (let parsedItem of parsed) {
        if (parsedItem.txt == '') {
          throw new Error('ERROR : 生成的代码太长或者不合法');
        }

        this.qwenClient.addUserMessage('我现在开始执行 : ' + parsedItem.txt);

        if (parsedItem.isText) {
          console.log('======= Continue =======');
          console.log(parsedItem.txt);
        } else if (
          parsedItem.txt.startsWith('npm') ||
          parsedItem.txt.startsWith('npm install') ||
          parsedItem.txt.startsWith('npm i')
        ) {
          console.log('======= npm install =======');
          console.log(parsedItem.txt);

          const { stderr, stdout } = await runShell(parsedItem.txt);
          console.log(stdout);
        } else if (['javascript', 'nodejs'].includes(parsedItem.codeType)) {
          console.log('======= Node execution =======');
          console.log(parsedItem.txt);

          try {
            await runNodeCode(parsedItem.txt);
            console.log('node 代码执行结束');
          } catch (err: any) {
            throw new Error(
              'Error: node 代码执行出错，具体错误是' + err.toString(),
            );
          }
        }

        if (parsedItem.txt.includes('DONE')) {
          console.log('======= DONE =======');
          isDone = true;
          return;
        }
      }

      await this.sleep(2000);

      if (!isDone) {
        this.execute('继续');
      }
    } catch (e) {
      await this.sleep(2000);
      this.handleError(e);
    } finally {
      this.qwenClient.save();
    }
  }

  async parseResult(result: string) {
    try {
      const list = parseCodeBlockToList(result);
      return list;
    } catch (e) {
      this.handleError('无法解析结果，请重新制定计划');
    }
  }

  async tryFixLlmCall(errorMessage: string) {
    try {
      const res = await this.qwenClient.chat(
        `${errorMessage}\n ${errorPromptTemplate}`,
      );
      const content = getResponseString(res);
      const parsed = await this.parseResult(content);
      await this.proceedResult(parsed);
    } catch (e) {
      this.handleError(e);
    }
  }
}
