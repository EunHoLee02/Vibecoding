const routes = ["/", "/sample", "/result"];

export function getCurrentRoute() {
  return routes.includes(window.location.pathname) ? window.location.pathname : "/";
}

export function navigate(path) {
  const target = routes.includes(path) ? path : "/";

  if (window.location.pathname !== target) {
    window.history.pushState({}, "", target);
  }

  window.dispatchEvent(new Event("routechange"));
}
