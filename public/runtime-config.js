// This file sets window.__API_HOST__ at load time from the build-time
// environment variable REACT_APP_API_URL (if provided). This offers a simple
// way to expose the API origin to the runtime JS bundle without changing the
// compiled code. If REACT_APP_API_URL is not set, this file is a noop.
(function(){
  try {
    // During the static build, create-react-app will replace process.env vars
    // inlined here only if used during build (this file is copied to build).
    var host = "%REACT_APP_API_URL%";
    // If the placeholder wasn't replaced, many hosts will leave it as-is; treat
    // empty or placeholder values as absent.
    if (host && host.indexOf('%REACT_APP_API_URL%') === -1 && host.trim() !== '') {
      window.__API_HOST__ = host.replace(/\/$/, '');
      console.info('runtime-config: set window.__API_HOST__');
    }
  } catch (e) {
    // ignore
  }
})();
