import base58 from 'bs58';
import { models } from '@ots-share/model';

const REVEAL_CONTENT_URL_PATH = 'r';
const idKeySeparator = ':';

export type parsedPathType = {
  id: string;
  password: string;
  fileName?: string;
};

export function buildUrlToShare(
  domain: string,
  response: models.IRecord,
  encriptionKey: string,
  fileName?: string
): string {
  const encoder = new TextEncoder();
  const urlPath = [response.id, encriptionKey];

  if (fileName) {
    urlPath.push(fileName);
  }

  const encodedArray = encoder.encode(urlPath.join(idKeySeparator));

  return [domain, REVEAL_CONTENT_URL_PATH, encodeURIComponent(base58.encode(encodedArray))].join(
    '/'
  );
}

export function parseAndExtractUrl(url: string): parsedPathType | undefined {
  const { pathname } = new URL(url);
  const [, , keyIdPath] = pathname.split('/', 3);

  if (!keyIdPath) {
    return undefined;
  }

  const decodedString = decodeURIComponent(keyIdPath);

  return base58Decode(decodedString) ?? base64Decode(decodedString);
}

function base58Decode(stringToDecode: string): parsedPathType | undefined {
  const decoder = new TextDecoder();
  const text = decoder.decode(base58.decode(stringToDecode));
  const [id, password, fileName] = text.split(idKeySeparator);

  if (!id || !password) {
    return undefined;
  }

  return {
    id,
    password,
    fileName,
  };
}

function base64Decode(stringToDecode: string): parsedPathType | undefined {
  const [id, password, fileName] = atob(stringToDecode).split(idKeySeparator);

  if (!id || !password) {
    return undefined;
  }

  return {
    id,
    password,
    fileName,
  };
}
