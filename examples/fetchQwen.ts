import { apiKey } from '../config';
import {
  ModelName,
  QwenParameters,
  QwenRequest,
  RequestHeader,
  Role,
} from '../src/types';

// 定义请求的URL和API-KEY
const apiURL =
  'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

// 定义请求头部
const requestHeader: RequestHeader = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${apiKey}`,
};
// 定义请求体
const requestModel: ModelName = ModelName.QWEN_TURBO;
const messages = [
  { role: Role.System, content: 'You are a helpful assistant.' },
  { role: Role.User, content: 'How can I make tomato and egg soup?' },
];
const parameters: QwenParameters = {
  result_format: 'message',
};
const qwenRequest: QwenRequest = {
  model: requestModel,
  input: { messages: messages },
  parameters: parameters,
};
// 构建请求体
const requestBody = JSON.stringify(qwenRequest);

async function sendQwenRequest() {
  // 发起fetch请求
  const res = await fetch(apiURL, {
    method: 'POST',
    body: requestBody,
    headers: requestHeader,
  });

  if (!res.ok) {
    throw new Error('Network response was not ok ' + res.statusText);
  }
  console.log(await res.text());
}
sendQwenRequest();
