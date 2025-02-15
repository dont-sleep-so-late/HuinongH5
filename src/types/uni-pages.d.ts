/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// Generated by vite-plugin-uni-pages

interface NavigateToOptions {
  url: "/pages/index/index" |
       "/pages/about/about" |
       "/pages/cart/index" |
       "/pages/category/index" |
       "/pages/forgot-password/index" |
       "/pages/login/index" |
       "/pages/message/index" |
       "/pages/publish/index" |
       "/pages/register/index" |
       "/pages/role/index" |
       "/pages/shelf/index" |
       "/pages/user/index";
}
interface RedirectToOptions extends NavigateToOptions {}

interface SwitchTabOptions {
  url: "/pages/index/index" | "/pages/category/index" | "/pages/cart/index" | "/pages/user/index"
}

type ReLaunchOptions = NavigateToOptions | SwitchTabOptions;

declare interface Uni {
  navigateTo(options: UniNamespace.NavigateToOptions & NavigateToOptions): void;
  redirectTo(options: UniNamespace.RedirectToOptions & RedirectToOptions): void;
  switchTab(options: UniNamespace.SwitchTabOptions & SwitchTabOptions): void;
  reLaunch(options: UniNamespace.ReLaunchOptions & ReLaunchOptions): void;
}
