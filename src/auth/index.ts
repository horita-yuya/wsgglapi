import type { GoogleAuth2Scope } from "./scope";

//
//     Your Service                                        Google Server
//  1. Create & sign jwt
//  2. Use 1's jwt, requesting token         ---->       Issue and return token
//  3. Receive token                         <----
//
//  4. Call Google API                       ---->
// https://developers.google.com/identity/protocols/oauth2/service-account#httprest
export async function generateJwt({
  serviceAccount,
  claims,
}: {
  serviceAccount: { privateKey: string; clientEmail: string; tokenUri: string };
  claims: {
    // The time the assertion was issued, specified as seconds since 00:00:00 UTC, January 1, 1970.
    iat: Date | number;
    // The expiration time of the assertion, specified as seconds since 00:00:00 UTC, January 1, 1970. This value has a maximum of 1 hour after the issued time.
    exp?: Date | number;
    scope: GoogleAuth2Scope | GoogleAuth2Scope[];
  };
}): Promise<string> {
  const privateKeyPem = serviceAccount.privateKey;
  const clientEmail = serviceAccount.clientEmail;

  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const iat =
    typeof claims.iat === "number"
      ? claims.iat
      : Math.floor(claims.iat.getTime() / 1000);

  const exp = claims.exp
    ? typeof claims.exp === "number"
      ? claims.exp
      : Math.floor(claims.exp.getTime() / 1000)
    : iat + 3600;

  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: serviceAccount.tokenUri,
    iat: iat,
    exp: exp,
    // https://www.rfc-editor.org/rfc/rfc8693#name-scope-scopes-claim
    scope: Array.isArray(claims.scope) ? claims.scope.join(" ") : claims.scope,
  };

  const base64UrlEncode = (obj: unknown) => {
    return btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
  const importPrivateKey = async (pem: string) => {
    const binaryDer = str2ab(pemToDer(pem));
    return crypto.subtle.importKey(
      "pkcs8",
      binaryDer,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: { name: "SHA-256" },
      },
      false,
      ["sign"],
    );
  };

  const str2ab = (str: string) => {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  };

  const pemToDer = (pem: string) => {
    const lines = pem.trim().split("\n");
    const base64 = lines.slice(1, lines.length - 1).join("");
    return atob(base64);
  };

  const privateKey = await importPrivateKey(privateKeyPem);

  const sign = async (data: string, key: CryptoKey) => {
    const encoder = new TextEncoder();
    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      key,
      encoder.encode(data),
    );
    return btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const signature = await sign(unsignedToken, privateKey);

  return `${unsignedToken}.${signature}`;
}

export async function requestAccessToken(jwt: string): Promise<{
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}> {
  const query = new URLSearchParams({
    assertion: jwt,
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
  }).toString();
  const result = await fetch(`https://oauth2.googleapis.com/token?${query}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const json = await result.json();

  return {
    accessToken: json.access_token,
    expiresIn: json.expires_in,
    tokenType: json.token_type,
  };
}
