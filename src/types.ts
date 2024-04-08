// https://help.aliyun.com/zh/dashscope/developer-reference/api-details?spm=a2c4g.11186623.0.0.3cb84e4eygiSr6#602895ef3dtl1
export enum Role {
  System = 'system',
  User = 'user',
  Assistant = 'assistant',
  Tool = 'tool',
}

export interface Message {
  role: Role;
  content: string;
  /**
   * request 的时候用来表明是哪个工具返回的结果
   */
  name?: string;
  /**
   * response 中会带上工具调用
   */
  tool_calls?: ToolCall[];
}

export interface RequestHeader {
  'Content-Type': string;
  Authorization: string; // API-KEY
  // 可选值 enable
  'X-DashScope-SSE'?: string; // 与 Accept 二选一，这里就保留 X-DashScope-SSE
  [key: string]: any;
}

export enum ModelName {
  QWEN_TURBO = 'qwen-turbo',
  QWEN_PLUS = 'qwen-plus',
  QWEN_MAX = 'qwen-max',
  QWEN_MAX_0403 = 'qwen-max-0403',
  QWEN_MAX_0107 = 'qwen-max-0107',
  QWEN_MAX_1201 = 'qwen-max-1201',
  QWEN_MAX_LONGCONTEXT = 'qwen-max-longcontext',
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: {
        [key: string]: {
          type: 'string' | 'number' | 'boolean';
          description?: string;
          enum?: Array<string>;
          required?: Array<string>;
        };
      };
    };
  };
}

export interface ToolCall {
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface QwenParameters {
  result_format?: 'text' | 'message';
  /**
   * 在使用seed时，模型将尽可能生成相同或相似的结果，但目前不保证每次生成的结果完全相同。
   * @default 65535
   */
  seed?: number;
  /**
   * 用于限制模型生成token的数量
   * qwen-turbo最大值和默认值为1500，qwen-max、qwen-max-1201 、qwen-max-longcontext 和 qwen-plus最大值和默认值均为2000
   * @default 1500
   */
  max_tokens?: number;
  /**
   * 核采样方法的概率阈值
   * @default 0.8
   */
  top_p?: number;
  /**
   * 采样候选集的大小
   * 取值越大，生成的随机性越高；取值越小，生成的确定性越高
   * @default 50
   */
  top_k?: number;
  /**
   * 用于控制模型生成时的重复度
   * @default 1.1
   */
  repetition_penalty?: number;
  /**
   * 控制文本生成的概率分布，值越小生成的文本越确定，值越大生成的文本越随机
   * 范围：0～2
   * @default 0.85
   */
  temperature?: number;
  /**
   * 停止符
   */
  stop?: string | Array<string | number>;
  /**
   * 是否开启搜索
   * @default false
   */
  enable_search?: boolean;
  /**
   * 流式输出的时候是否增量输出
   * @default false
   */
  incremental_output?: boolean;
  /**
   * 是否启用工具 无法和 incremental_output 同时使用
   */
  tools?: Tool[];
}

export interface QwenRequest {
  model: ModelName;
  input: {
    prompt?: string;
    messages?: Array<Message>;
  };
  parameters?: QwenParameters;
}

export interface QwenResponse {
  /**
   * parameters.result_format 为 text 时返回
   */
  output: {
    text?: string;
    finish_reason: string;
    choices: {
      finish_reason: string;
      message: Message;
    }[];
  };
  usage: {
    total_tokens: number;
    output_tokens: number;
    input_tokens: number;
  };
  request_id: string;
}

export interface ChatResponse {
  success: boolean;
  value?: QwenResponse;
  errorMessage?: string;
}

export interface CodeBlock {
  isText: boolean;
  codeType: string;
  txt: string;
}
