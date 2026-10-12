import { writeFileSync } from 'node:fs';

const port = process.env.CDP_PORT ?? '9334';
const [command, ...args] = process.argv.slice(2);

const usage = 'usage: node cdp.mjs eval <expression> | click <text> | fill <id> <value> | screenshot <file.png>';

const expressions = {
  eval: ([expression]) => expression,
  click: ([text]) => `(() => {
    const target = [...document.querySelectorAll('button, a')].find((el) => el.textContent.trim() === ${JSON.stringify(text)});
    if (!target) throw new Error('no button or link with text ' + ${JSON.stringify(text)});
    target.click();
    return 'clicked ' + target.textContent.trim();
  })()`,
  fill: ([id, value]) => `(() => {
    const input = document.getElementById(${JSON.stringify(id)});
    if (!input) throw new Error('no element with id ' + ${JSON.stringify(id)});
    const proto = input instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, ${JSON.stringify(value)});
    input.dispatchEvent(new Event(input instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
    return input.id + ' = ' + input.value;
  })()`,
};

if (!(command in expressions) && command !== 'screenshot') {
  console.error(usage);
  process.exit(2);
}

const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = targets.find((target) => target.type === 'page');
if (!page) throw new Error(`no page target on CDP port ${port}`);

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

const call = (method, params) =>
  new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1e9);
    const onMessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id !== id) return;
      socket.removeEventListener('message', onMessage);
      message.error ? reject(new Error(message.error.message)) : resolve(message.result);
    };
    socket.addEventListener('message', onMessage);
    socket.send(JSON.stringify({ id, method, params }));
  });

try {
  if (command === 'screenshot') {
    const { data } = await call('Page.captureScreenshot', { format: 'png' });
    writeFileSync(args[0], Buffer.from(data, 'base64'));
    console.log(`saved ${args[0]}`);
  } else {
    const { result, exceptionDetails } = await call('Runtime.evaluate', {
      expression: expressions[command](args),
      awaitPromise: true,
      returnByValue: true,
    });
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
    console.log(typeof result.value === 'string' ? result.value : JSON.stringify(result.value));
  }
} finally {
  socket.close();
}
