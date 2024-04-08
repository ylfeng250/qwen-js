export async function runNodeCode(code: string) {
  return new Promise<any>(async (resolve, reject) => {
    try {
      const asyncCode = `
            (async () => {
                ${code}
            }
            )();
            `;
      // SyntaxError: Cannot use import statement outside a module
      //   const fn = new Function(asyncCode);
      const res = await eval(asyncCode);
      resolve(res);
    } catch (error) {
      console.error('Error executing code:', error);
      reject(error);
    }
  });
}
