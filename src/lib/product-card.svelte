<script lang="ts" context="module">
  // Used for unique ids
  let i = 0;
</script>

<script lang="ts">
  import type { Product } from '$lib/types';
  export let product: Product;
  export let onAddToCart: (product: Product) => void;
  const headingId = `suggested-product-heading-${i++}`;
</script>

<li class="group relative" aria-labelledby={headingId}>
  <div
    class="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none"
  >
    <img
      src={`https://placeimg.com/480/640/animals?cache-block=${product.id}`}
      alt=""
      class="w-full h-full object-center object-cover lg:w-full lg:h-full"
    />
  </div>
  <div class="mt-4 flex justify-between items-center">
    <div>
      <h3 class="text-sm text-gray-700" id={headingId}>
        <a href={`/products/${product.id}`}>
          <span aria-hidden="true" class="absolute inset-0" />
          {product.name}
        </a>
      </h3>
    </div>
    <p class="text-sm font-medium text-gray-900">{`$${product.price}`}</p>
    <button
      on:click={() => onAddToCart(product)}
      class="text-sm px-4 py-3 -my-1 rounded relative font-medium text-indigo-600 hover:text-indigo-500 hover:bg-purple-100"
    >
      <div aria-hidden="true">+ Add</div>
      <div class="sr-only">Add to cart</div>
    </button>
  </div>
</li>
