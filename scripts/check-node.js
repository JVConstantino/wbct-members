const REQUIRED_MAJOR = 20;
const major = parseInt((process.versions.node || "").split(".")[0], 10);
if (!Number.isFinite(major) || major < REQUIRED_MAJOR) {
  console.error(
    `\n[wbct] Node ${process.versions.node} is not supported. ` +
      `Next 16 and the rest of the stack require Node >= ${REQUIRED_MAJOR}.0.0.\n` +
      `[wbct] If this is the Easy Panel / Nixpacks build, set:\n` +
      `[wbct]   NIXPACKS_NODE_VERSION=20\n` +
      `[wbct] in the project's environment variables, or update .nixpacks.toml.\n`
  );
  process.exit(1);
}
console.log(`[wbct] Node ${process.versions.node} OK (>= ${REQUIRED_MAJOR}).`);
