import util from 'util';
import child_process from 'child_process';
const appPath = process.cwd();

// 调用util.promisify方法，返回一个promise,如const { stdout, stderr } = await exec('ls')
const exec = util.promisify(child_process.exec);

export const runShell = async function (code: string) {
  const { stderr, stdout } = await exec(code, { cwd: appPath });
  return { stderr, stdout };
};
