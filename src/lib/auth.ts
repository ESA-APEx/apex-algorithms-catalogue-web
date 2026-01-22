export const logOut = async () => {
  const callbackUrl = new URL(window.location.origin);
  callbackUrl.searchParams.set("toastSuccess", "logout");
  await window.signOut({
    // @ts-ignore
    callbackUrl: callbackUrl.href,
  });
};
