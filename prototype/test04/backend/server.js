const { createApp } = require("./src/app");

const port = Number(process.env.PORT || 3104);
const app = createApp();

app.listen(port, () => {
  console.log(`Well Track Prototype server running on http://localhost:${port}`);
});
