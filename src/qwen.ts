import {
  ChatResponse,
  Message,
  ModelName,
  QwenParameters,
  QwenRequest,
  QwenResponse,
  RequestHeader,
  Role,
} from '../src/types';
import * as fs from 'fs';
import { getResponseString } from './utils';

// 定义请求的URL和API-KEY
const apiURL =
  'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

export class QwenClient {
  private apiURL: string;
  private apiKey: string;
  private requestHeader: RequestHeader;
  private requestModel: ModelName;
  private messages: { role: Role; content: string }[];
  private parameters: QwenParameters;

  private systemPrompt: string;

  constructor({
    apiKey,
    systemPrompt,
    modelName,
    stream,
    initMessages,
    parameters = {},
  }: {
    apiKey: string;
    systemPrompt?: string;
    modelName?: ModelName;
    stream?: boolean;
    initMessages?: Message[];
    parameters?: QwenParameters;
  }) {
    this.apiURL = apiURL;
    this.apiKey = apiKey;
    this.requestHeader = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };
    if (stream) {
      this.requestHeader['X-DashScope-SSE'] = 'enable';
    }

    this.requestModel = modelName ?? ModelName.QWEN_PLUS;
    this.systemPrompt = systemPrompt ?? 'You are a helpful assistant.';

    // 初始化消息列表
    this.messages = initMessages ?? [
      {
        role: Role.System,
        content: this.systemPrompt,
      },
    ];

    // 初始化请求参数
    this.parameters = {
      result_format:
        parameters?.result_format ?? parameters?.result_format ?? 'message',
      ...parameters,
    };
  }

  getRequestBody(prompt: string) {
    let qwenRequest: QwenRequest;
    if (this.parameters.result_format === 'message') {
      this.addUserMessage(prompt);
      qwenRequest = {
        model: this.requestModel,
        input: { messages: [...this.messages] },
        parameters: this.parameters,
      };
    } else {
      qwenRequest = {
        model: this.requestModel,
        input: { prompt },
        parameters: this.parameters,
      };
    }

    return JSON.stringify(qwenRequest);
  }

  async chat(prompt: string): Promise<ChatResponse> {
    try {
      const requestBody = this.getRequestBody(prompt);
      const res = await fetch(this.apiURL, {
        method: 'POST',
        body: requestBody,
        headers: this.requestHeader,
      });
      if (!res.ok) {
        throw new Error('Network response was not ok ' + res.statusText);
      }
      const contentJson = (await res.json()) as QwenResponse;
      const response = {
        success: res.ok,
        value: contentJson,
      };
      const contentText = getResponseString(response);
      this.addAssistantMessage(contentText);
      return response;
    } catch (err: any) {
      return {
        success: false,
        errorMessage: err.message,
      };
    }
  }

  addUserMessage(content: string): void {
    this.messages.push({ role: Role.User, content });
  }

  addAssistantMessage(content: string): void {
    this.messages.push({ role: Role.Assistant, content });
  }

  addSystemMessage(content: string): void {
    if (this.messages[0].role === Role.System) {
      this.messages[0].content = content;
    } else {
      this.messages.unshift({ role: Role.System, content });
    }
  }
  clearMessages(): void {
    this.messages = [{ role: Role.System, content: this.systemPrompt }];
  }
  save(): void {
    const filePath = `qwen_message_${new Date().getTime()}.txt`;
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '');
    }
    let txt = '';
    for (const message of this.messages) {
      txt = `
      --${txt} ${message.role}
      ${message.content}
      --
      `;
    }
    fs.appendFileSync(filePath, txt);
  }
}
