<nav class="border-b border">
  <div class="flex px-5 h-[3rem] justify-between items-center container mx-auto text-sm">
    <a href="/">
      <img class="inline w-7" src="/logo.png" alt="otog" />
      <span class="ml-1 font-bold">OTOG.APP</span>
    </a>
    <div class="font-bold">MENU</div>
  </div>
</nav>
<div class="min-h-[calc(100vh-6rem)]">
  <slot />
</div>
<footer class="border border-t text-sm">
  <div class="container px-5 h-[3rem] grid place-content-center">
    <span>
      contribute is always welcome at <a
        class="underline text-primary"
        href="https://github.com/krist7599555/otog.app">github</a
      >
    </span>
  </div>
</footer>
