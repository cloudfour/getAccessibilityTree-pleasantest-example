<script lang="ts">
  import clsx from 'clsx';
  let className: string = undefined;
  export let href: string = undefined;
  export { className as class };
</script>

{#if href === undefined}
  <button
    class={clsx('p-3 rounded-md hover:bg-purple-100', className)}
    on:click
  >
    <slot />
  </button>
{:else}
  <a
    {href}
    class={clsx('p-3 rounded-md hover:bg-purple-100 text-center', className)}
    on:click
  >
    <slot />
  </a>
{/if}
