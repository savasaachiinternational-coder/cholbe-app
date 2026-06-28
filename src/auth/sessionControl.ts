type LogoutHandler = () => void | Promise<void>;

let logoutHandler: LogoutHandler | null = null;

export function setLogoutHandler(handler: LogoutHandler) {
  logoutHandler = handler;
}

export async function performLogout() {
  await logoutHandler?.();
}
