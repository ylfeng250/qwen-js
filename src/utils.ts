import { ChatResponse } from './types';

export function getResponseString(response: ChatResponse): string {
  const { success, errorMessage, value } = response;
  if (success) {
    return value?.output?.choices?.[0]?.message?.content || '';
  }
  return errorMessage || '大模型执行报错';
}
