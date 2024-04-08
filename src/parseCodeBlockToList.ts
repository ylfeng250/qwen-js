/**
 * 从返回结果中提取代码块
 */

import { CodeBlock } from './types';

export function parseCodeBlockToList(inputString: string): Array<CodeBlock> {
  const lines = inputString.split('\n');
  const result: Array<{ isText: boolean; codeType: string; txt: string }> = [];
  let currentBlock: { isText: boolean; codeType: string; txt: string } | null =
    null;

  for (const line of lines) {
    // 判断是否是代码块
    if (line.includes('```')) {
      const codeTypeMatch =
        line.match(/^```(\w+)/) || line.match(/^\`\`\`(\w+)/);
      // 代码块的起点
      if (codeTypeMatch) {
        const codeType = codeTypeMatch[1];
        currentBlock = {
          isText: false,
          codeType: codeType.trim(),
          txt: '',
        };
      } else {
        // 代码块的终点
        if (currentBlock) {
          result.push(currentBlock);
          currentBlock = null;
        } else {
          currentBlock = {
            isText: false,
            codeType: 'nodejs',
            txt: '',
          };
        }
      }
    } else {
      if (currentBlock) {
        currentBlock.txt += line + '\n';
      } else {
        if (result.length > 0 && result[result.length - 1].isText) {
          result[result.length - 1].txt += line + '\n';
        } else {
          result.push({
            isText: true,
            // @ts-ignore
            codeType: '',
            txt: line,
          });
        }
      }
    }
  }

  return result;
}
