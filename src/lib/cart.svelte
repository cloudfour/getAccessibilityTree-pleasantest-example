<script lang="ts" context="module">
  // Used for unique ids
  let i = 0;
</script>

<script lang="ts">
  import ProductCard from './product-card.svelte';
  import Button from './button.svelte';
  import type { Product, CartItemData } from '$lib/types';
  import CartItem from './cart-item.svelte';

  const id = i++;

  export let initialItems: CartItemData[];
  let cartItems = new Map(initialItems.map((item) => [item.product.id, item]));
  export let showSuggestedProducts = false;

  const popularItems: Product[] = [
    { name: 'iPhone', price: 1000, id: 25 },
    { name: 'iPad', price: 1200, id: 30 },
    { name: 'MacBook', price: 2000, id: 43 },
    { name: 'MacBook Pro', price: 2500, id: 90 },
  ];

  $: numItems = [...cartItems.values()].reduce(
    (total, item) => total + item.quantity,
    0,
  );

  $: totalProductsCost = [...cartItems.values()].reduce(
    (total, item) => total + item.quantity * item.product.price,
    0,
  );

  $: shippingCost = 10;

  const summaryHeadingId = `cart-summary-${id}`;
</script>

<div class="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
  <h1 class="text-2xl font-bold tracking-tight text-gray-900 text-center">
    Cart
    <span
      >{numItems > 0
        ? `(${numItems} item${numItems === 1 ? '' : 's'})`
        : '(empty)'}</span
    >
  </h1>

  {#if numItems > 0}
    <div
      class="grid lg:grid-cols-[max-content_max-content] items-start mt-6 w-min mx-auto gap-x-6 xl:gap-x-8"
    >
      <table aria-label="Cart items" class="cart-table">
        <thead class="sr-only">
          <tr>
            <th>Item</th>
            <th>Price per item</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {#each [...cartItems.values()] as cartItem (cartItem.product.id)}
            <CartItem
              {cartItem}
              onChangeQty={(newQty) => {
                if (newQty === 0) cartItems.delete(cartItem.product.id);
                else cartItem.quantity = newQty;
                cartItems = cartItems;
              }}
            />
          {/each}
        </tbody>
      </table>
      <section
        class="bg-gray-100 rounded-md p-4 relative grid gap-y-4"
        aria-labelledby={summaryHeadingId}
      >
        <h2 class="text-xl font-bold tracking-tight" id={summaryHeadingId}>
          Summary
        </h2>
        <ul class="grid grid-cols-full gap-y-1">
          <li>
            <strong>Items:</strong>
            <span>{numItems}</span>
          </li>
          <li>
            <strong>Subtotal:</strong>
            <span>{`$${totalProductsCost}`}</span>
          </li>
          <li>
            <strong>Shipping:</strong>
            <span>{`$${shippingCost} to US addresses`}</span>
          </li>
          <li
            class="mt-7 before:absolute before:w-full before:block before:border-t before:border-gray-200 before:left-0 before:right-0 before:-translate-y-4"
          >
            <strong>Total:</strong>
            <span>{`$${totalProductsCost + shippingCost}`}</span>
          </li>
        </ul>
        <Button
          href="/checkout"
          class="w-full text-white bg-indigo-700 hover:bg-indigo-600 font-bold"
          >Checkout</Button
        >
      </section>
    </div>
  {/if}
</div>

{#if showSuggestedProducts}
  <div
    class="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8"
  >
    <h2 class="text-2xl font-bold tracking-tight text-gray-900 text-center">
      Popular items
    </h2>

    <ul
      class="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8"
    >
      {#each popularItems as product (product.id)}
        <ProductCard
          onAddToCart={(product) => {
            const existingCartItem = cartItems.get(product.id);
            if (existingCartItem) {
              existingCartItem.quantity++;
            } else {
              cartItems.set(product.id, { product, quantity: 1 });
            }
            cartItems = cartItems;
          }}
          {product}
        />
      {/each}
    </ul>
  </div>
{/if}

<style>
  .cart-table {
    --gap-x: 1.5rem;
    --gap-y: 1.3rem;
    margin: calc(var(--gap-y) / -2) calc(var(--gap-x) / -2);
  }
  .cart-table :global(td) {
    padding: calc(var(--gap-y) / 2) calc(var(--gap-x) / 2);
  }
</style>
