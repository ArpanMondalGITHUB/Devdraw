import app  from "./app";
import { config } from "./config/config";
const port = Number(config.port ?? 3001)

app.listen(port,() => {
  console.log(`Devdraw API listening on http://localhost:${port}`)
})