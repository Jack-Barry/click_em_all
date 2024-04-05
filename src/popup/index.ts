import App from "./App.svelte";
import "../assets/fonts/ITCSerifGothic/ITCSerifGothic.css";
import "../assets/styles/main.css";

const app = new App({
  target: document.getElementById("app")!,
});

export default app;
