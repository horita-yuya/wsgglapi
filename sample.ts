import { generateJwt, requestAccessToken } from "./src/auth";

async function sample() {
  const jwt = await generateJwt({
    serviceAccount: {
      privateKey: "TODO",
      clientEmail: "TODO",
      tokenUri: "https://oauth2.googleapis.com/token",
    },
    claims: {
      iat: new Date(),
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    },
  });

  const result = await requestAccessToken(jwt);
  console.log(result);
}

sample().then(() => console.log("done"));
