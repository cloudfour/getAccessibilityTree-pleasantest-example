import {
  ElementHandle,
  PleasantestContext,
  withBrowser,
  getAccessibilityTree,
} from 'pleasantest';

import type { CartItemData } from './types';

const products = {
  iphone: {
    name: 'iPhone',
    price: 1000,
    id: 25,
  },
  ipad: {
    name: 'iPad',
    price: 1200,
    id: 30,
  },
  macbook: {
    name: 'MacBook',
    price: 2000,
    id: 43,
  },
};

// 1. This utility function is used in each of the tests to render the cart svelte component with the provided props.
const renderCart = async (
  { utils, page }: Pick<PleasantestContext, 'utils' | 'page'>,
  props: {
    initialItems: CartItemData[];
    showSuggestedProducts: boolean;
  },
) => {
  utils.loadCSS('../app.css');
  const root = await page.evaluateHandle<ElementHandle>(() => {
    const root = document.createElement('div');
    document.body.append(root);
    return root;
  });
  await utils.runJS(
    `
      import Cart from './cart.svelte';
      export default (root, props) => {
        new Cart({
          target: root,
          props,
        });
      };
    `,
    [root, props],
  );
  return root;
};

// 2. First we will test the accessibility structure of the cart table and of the cart summary.
// This test will also check that all the numbers in the summary are correct.
test(
  'Basic structure and accessibility',
  withBrowser(async ({ utils, page, screen }) => {
    const root = await renderCart(
      { utils, page },
      {
        showSuggestedProducts: false,
        initialItems: [
          { product: products.iphone, quantity: 2 },
          { product: products.ipad, quantity: 1 },
        ],
      },
    );
    // 3. This is a good place to use getAccessibilityTree because there are a lot of different elements and roles here,
    // and using getAccessibilityTree is much faster than writing individual assertions for each element.
    expect(await getAccessibilityTree(root)).toMatchInlineSnapshot(`
      heading "Cart (3 items)"
        text "Cart"
        text "(3 items)"
      table "Cart items"
        rowgroup
          row "Item Price per item Quantity"
            columnheader "Item"
              text "Item"
            columnheader "Price per item"
              text "Price per item"
            columnheader "Quantity"
              text "Quantity"
        rowgroup
          row "iPhone $1000 Edit Quantity Remove"
            cell "iPhone"
              link "iPhone"
                text "iPhone"
            cell "$1000"
              text "$1000"
            cell "Edit Quantity Remove"
              button "Edit Quantity"
              button "Remove"
          row "iPad $1200 Edit Quantity Remove"
            cell "iPad"
              link "iPad"
                text "iPad"
            cell "$1200"
              text "$1200"
            cell "Edit Quantity Remove"
              button "Edit Quantity"
              button "Remove"
      region "Summary"
        heading "Summary"
          text "Summary"
        list
          listitem
            text "Items:"
            text "3"
          listitem
            text "Subtotal:"
            text "$3200"
          listitem
            text "Shipping:"
            text "$10 to US addresses"
          listitem
            text "Total:"
            text "$3210"
        link "Checkout"
          text "Checkout"
    `);

    // 4. Then we'll also manually write an assertion to check that the checkout button has the correct href,
    // since this is not represented in the accessibility tree.
    const checkoutButton = await screen.getByRole('link', {
      name: /checkout/i,
    });
    await expect(checkoutButton).toHaveAttribute('href', '/checkout');
  }),
);

// 5. This test makes sure that the quantity editing experience works,
// and that the cart summary is updated correctly.
test(
  'Changing quantity',
  withBrowser(async ({ utils, page, screen, within, user }) => {
    await renderCart(
      { utils, page },
      {
        showSuggestedProducts: false,
        initialItems: [{ product: products.iphone, quantity: 2 }],
      },
    );
    const cartItemsList = await screen.getByRole('table', {
      name: /cart items/i,
    });
    const summary = await screen.getByRole('region', {
      name: /summary/i,
    });
    // 6. Here we are splitting the accessibility trees for the cart items table and the summary.
    // This will let us check one or the other individually throughout the test.

    // 7. Here we're checking the initial state before editing.
    expect(await getAccessibilityTree(cartItemsList)).toMatchInlineSnapshot(`
      table "Cart items"
        rowgroup
          row "Item Price per item Quantity"
            columnheader "Item"
              text "Item"
            columnheader "Price per item"
              text "Price per item"
            columnheader "Quantity"
              text "Quantity"
        rowgroup
          row "iPhone $1000 Edit Quantity Remove"
            cell "iPhone"
              link "iPhone"
                text "iPhone"
            cell "$1000"
              text "$1000"
            cell "Edit Quantity Remove"
              button "Edit Quantity"
              button "Remove"
    `);
    expect(await getAccessibilityTree(summary)).toMatchInlineSnapshot(`
      region "Summary"
        heading "Summary"
          text "Summary"
        list
          listitem
            text "Items:"
            text "2"
          listitem
            text "Subtotal:"
            text "$2000"
          listitem
            text "Shipping:"
            text "$10 to US addresses"
          listitem
            text "Total:"
            text "$2010"
        link "Checkout"
          text "Checkout"
    `);
    const editQuantityButton = await within(cartItemsList).findByRole(
      'button',
      { name: /edit quantity/i },
    );
    await user.click(editQuantityButton);

    // 8. After clicking the edit quantity button, we should see a focused number input field (spinbutton)
    // Notice that the accessibility tree automatically marks the focused element, so if that behavior changes,
    // the test will catch that possibly-unintentional change.
    expect(await getAccessibilityTree(cartItemsList)).toMatchInlineSnapshot(`
      table "Cart items"
        rowgroup
          row "Item Price per item Quantity"
            columnheader "Item"
              text "Item"
            columnheader "Price per item"
              text "Price per item"
            columnheader "Quantity"
              text "Quantity"
        rowgroup
          row "iPhone $1000 Quantity Save"
            cell "iPhone"
              link "iPhone"
                text "iPhone"
            cell "$1000"
              text "$1000"
            cell "Quantity Save"
              form
                text "Quantity"
                spinbutton "Quantity" (focused)
                button "Save"
    `);

    const qtyInput = await within(cartItemsList).findByRole('spinbutton');
    await expect(qtyInput).toHaveValue(2);
    await user.clear(qtyInput);
    await user.type(qtyInput, '5');

    // 9. After editing the quantity, the cart summary should be the same as before,
    // _until_ the save button is clicked.
    expect(await getAccessibilityTree(summary)).toMatchInlineSnapshot(`
      region "Summary"
        heading "Summary"
          text "Summary"
        list
          listitem
            text "Items:"
            text "2"
          listitem
            text "Subtotal:"
            text "$2000"
          listitem
            text "Shipping:"
            text "$10 to US addresses"
          listitem
            text "Total:"
            text "$2010"
        link "Checkout"
          text "Checkout"
    `);

    const saveButton = await within(cartItemsList).findByRole('button', {
      name: /save/i,
    });
    await user.click(saveButton);

    // 10. After the save button has been clicked, the summary should reflect the new quantity and total price.
    expect(await getAccessibilityTree(summary)).toMatchInlineSnapshot(`
      region "Summary"
        heading "Summary"
          text "Summary"
        list
          listitem
            text "Items:"
            text "5"
          listitem
            text "Subtotal:"
            text "$5000"
          listitem
            text "Shipping:"
            text "$10 to US addresses"
          listitem
            text "Total:"
            text "$5010"
        link "Checkout"
          text "Checkout"
    `);
  }),
);

// 11. This test checks the two ways to remove items from the card: clicking the remove button, and setting the quantity to 0.
// You'll notice that we aren't using getAccessibilityTree here.
// In this test there is never a need to check many elements at once, so checking them with individual assertions is easier.
test(
  'Removing items from cart',
  withBrowser(async ({ utils, page, within, user }) => {
    const root = await renderCart(
      { utils, page },
      {
        showSuggestedProducts: false,
        initialItems: [
          { product: products.ipad, quantity: 2 },
          { product: products.iphone, quantity: 1 },
        ],
      },
    );
    const cartHeading = await within(root).findByRole('heading', {
      name: /cart \(\d* items\)/i,
    });
    await expect(cartHeading).toHaveTextContent('3 items');

    // Remove the iPad by clicking the remove button
    const iPadRow = await within(root).findByRole('row', { name: /ipad/i });
    const iPhoneRow = await within(root).findByRole('row', { name: /iphone/i });
    const removeIPadButton = await within(iPadRow).findByRole('button', {
      name: /remove/i,
    });
    await user.click(removeIPadButton);
    await expect(iPadRow).not.toBeVisible();
    await expect(iPhoneRow).toBeVisible();

    // Remove the iphones by setting their quantity to 0
    // Click "edit quantity" button first
    await user.click(
      await within(iPhoneRow).findByRole('button', {
        name: /edit quantity/i,
      }),
    );
    const iphoneQty = await within(iPhoneRow).findByRole('spinbutton');
    await user.clear(iphoneQty);
    await user.type(iphoneQty, '0');
    const iphoneSaveBtn = await within(iPhoneRow).findByRole('button', {
      name: /save/i,
    });
    await user.click(iphoneSaveBtn);

    await expect(iPadRow).not.toBeVisible();
    await expect(iPhoneRow).not.toBeVisible();
  }),
);

// 12. This test checks the structure of the suggested products UI that can be displayed below the cart.
// It also checks that clicking the add to cart button on the suggested products adds the product to the cart.
test(
  'Suggested products UI',
  withBrowser(async ({ utils, page, screen, within, user }) => {
    const root = await renderCart(
      { utils, page },
      { showSuggestedProducts: true, initialItems: [] },
    );
    expect(await getAccessibilityTree(root)).toMatchInlineSnapshot(`
      heading "Cart (empty)"
        text "Cart"
        text "(empty)"
      heading "Popular items"
        text "Popular items"
      list
        listitem "iPhone"
          heading "iPhone"
            link "iPhone"
              text "iPhone"
          text "$1000"
          button "Add to cart"
        listitem "iPad"
          heading "iPad"
            link "iPad"
              text "iPad"
          text "$1200"
          button "Add to cart"
        listitem "MacBook"
          heading "MacBook"
            link "MacBook"
              text "MacBook"
          text "$2000"
          button "Add to cart"
        listitem "MacBook Pro"
          heading "MacBook Pro"
            link "MacBook Pro"
              text "MacBook Pro"
          text "$2500"
          button "Add to cart"
    `);
    const iPadItem = await screen.getByRole('listitem', { name: /ipad/i });
    const addIPadButton = await within(iPadItem).findByRole('button', {
      name: /add to cart/i,
    });
    await user.click(addIPadButton);
    const cartTable = await within(root).findByRole('table', {
      name: /cart items/i,
    });
    expect(await getAccessibilityTree(cartTable)).toMatchInlineSnapshot(`
      table "Cart items"
        rowgroup
          row "Item Price per item Quantity"
            columnheader "Item"
              text "Item"
            columnheader "Price per item"
              text "Price per item"
            columnheader "Quantity"
              text "Quantity"
        rowgroup
          row "iPad $1200 Edit Quantity Remove"
            cell "iPad"
              link "iPad"
                text "iPad"
            cell "$1200"
              text "$1200"
            cell "Edit Quantity Remove"
              button "Edit Quantity"
              button "Remove"
    `);
  }),
);
