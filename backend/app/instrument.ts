import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://b14c77ee7795ff0ec963a386e5ed5181@o4510987837374464.ingest.de.sentry.io/4510987951210576",
  sendDefaultPii: true,
});
