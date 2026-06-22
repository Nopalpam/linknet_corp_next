import { Buffer } from 'buffer';
import { randomUUID } from 'crypto';

function writeToBuffer(id, buf, offset = 0) {
  const bytes = Buffer.from(id.replace(/-/g, ''), 'hex');

  if (buf.length - offset < bytes.length) {
    throw new RangeError('UUID buffer too small');
  }

  for (let index = 0; index < bytes.length; index += 1) {
    buf[offset + index] = bytes[index];
  }

  return buf;
}

export function v4(options, buf, offset) {
  const id = randomUUID(options);
  return buf ? writeToBuffer(id, buf, offset) : id;
}

export default {
  v4
};
