import { createSocket } from 'node:dgram';

const port = Number(process.argv[2] ?? 19000);

const readString = (buf, offset) => {
  const end = buf.indexOf(0, offset);
  return [buf.toString('ascii', offset, end), (end + 4) & ~3];
};

const decode = (buf) => {
  const [address, afterAddress] = readString(buf, 0);
  const [tags, afterTags] = readString(buf, afterAddress);
  let offset = afterTags;
  const values = [...tags.slice(1)].map((tag) => {
    if (tag === 'T') return true;
    if (tag === 'F') return false;
    if (tag === 'f') return buf.readFloatBE((offset += 4) - 4);
    if (tag === 'i') return buf.readInt32BE((offset += 4) - 4);
    return `<${tag}>`;
  });
  return `${address} ${values.join(' ')}`;
};

createSocket('udp4')
  .on('message', (buf) => console.log(`${new Date().toISOString()} ${decode(buf)}`))
  .on('listening', () => console.log(`listening udp 127.0.0.1:${port}`))
  .bind(port, '127.0.0.1');
