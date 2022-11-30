try {
    console.log(require.resolve("vite"));
} catch (e) {
    console.error("Dependencies is not installed. Please run `npm run dep`.");
    process.exit(1);
}
