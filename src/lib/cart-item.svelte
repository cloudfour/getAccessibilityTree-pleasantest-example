<script lang="ts">
  import Button from '$lib/button.svelte';
  import type { CartItemData } from '$lib/types';
  import clsx from 'clsx';
  export let cartItem: CartItemData;
  let isEditingQty = false;
  let qtyInputEl: HTMLInputElement;
  export let onChangeQty: (qty: number) => void;
  const focusInput = (el: HTMLInputElement) => {
    el.focus();
  };
  let suggestSave = false;
</script>

<tr>
  <td>
    <a
      href={`/products/${cartItem.product.id}`}
      class="font-bold underline text-indigo-800"
    >
      {cartItem.product.name}
    </a>
  </td>
  <td>{`$${cartItem.product.price}`}</td>
  <td class="flex gap-[var(--gap-x)] justify-between">
    {#if isEditingQty}
      <form
        class="flex items-center gap-3 justify-between w-full"
        on:submit|preventDefault={() => {
          isEditingQty = false;
          suggestSave = false;
          onChangeQty(qtyInputEl.valueAsNumber);
        }}
      >
        <label>
          <span class="sr-only">Quantity</span>
          <input
            type="number"
            min="0"
            class="w-16 px-2 text-center"
            value={cartItem.quantity}
            bind:this={qtyInputEl}
            use:focusInput
            on:blur={() => {
              const isChanged = qtyInputEl.valueAsNumber !== cartItem.quantity;
              suggestSave = isChanged;
              if (!isChanged) isEditingQty = false;
            }}
          />
        </label>
        <Button
          class={clsx(
            '-mx-2 -my-3 text-gray-400 text-xs tracking-tight uppercase hover:text-green-600 hover:bg-gray-100',
            suggestSave && 'bg-green-100 text-green-600',
          )}>Save</Button
        >
      </form>
    {:else}
      <Button
        class="inline-flex items-center space-between ml-auto gap-1 -mx-2 -my-3"
        on:click={() => (isEditingQty = true)}
      >
        <span
          aria-hidden="true"
          class="text-gray-400 text-xs tracking-tight uppercase"
        >
          Qty:
        </span>
        <span aria-hidden="true">{cartItem.quantity}</span>
        <span class="sr-only">Edit Quantity</span>
      </Button>
      <Button
        class="-mx-2 -my-3 text-gray-400 text-xs tracking-tight uppercase hover:text-red-600"
        on:click={() => {
          onChangeQty(0);
        }}
      >
        Remove
      </Button>
    {/if}
  </td>
</tr>
